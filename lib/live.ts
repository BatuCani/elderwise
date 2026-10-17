"use client";

import { GoogleGenAI, type LiveServerMessage, type Session } from "@google/genai";
import { useSyncExternalStore } from "react";
import type { Lang } from "@/prompts/elderwise";
import { ASK_TOOL, LIVE_MODELS, liveConfig } from "@/prompts/live";

// Hands-free voice conversation through Gemini Live. Gemini listens and speaks; every real question
// goes to Claude through the ask_elderwise tool. One conversation at a time, kept outside React so it
// keeps running while the person looks at the Answers tab.

export type LiveStatus = "idle" | "connecting" | "listening" | "thinking" | "speaking";
export type LiveState = { status: LiveStatus; heard: string; said: string };

export type LiveOptions = {
  lang: Lang;
  name: string;
  // Answers the question with Claude and returns what Gemini should say.
  ask: (question: string) => Promise<{ headline: string; sentence: string }>;
};

const IDLE: LiveState = { status: "idle", heard: "", said: "" };
const listeners = new Set<() => void>();
let state = IDLE;

function set(patch: Partial<LiveState>) {
  state = { ...state, ...patch };
  listeners.forEach((l) => l());
}

export function useLive(): LiveState {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    () => state,
    () => IDLE,
  );
}

export function liveSupported(): boolean {
  return typeof window !== "undefined" && "AudioWorkletNode" in window && !!navigator.mediaDevices?.getUserMedia;
}

// Turns mic samples into 16-bit PCM on the audio thread and hands over ~100 ms blocks (16 kHz) without
// copying. The AudioContext's sampleRate does the resampling. Pattern from Orbs (micro-intent pcm-worklet.js).
const CAPTURE_WORKLET = `
class Capture extends AudioWorkletProcessor {
  constructor() { super(); this.buf = new Int16Array(1600); this.n = 0; }
  process(inputs) {
    const ch = inputs[0][0];
    if (ch) for (let i = 0; i < ch.length; i++) {
      const v = Math.max(-1, Math.min(1, ch[i]));
      this.buf[this.n++] = v < 0 ? v * 0x8000 : v * 0x7fff;
      if (this.n === this.buf.length) {
        this.port.postMessage(this.buf.buffer, [this.buf.buffer]);
        this.buf = new Int16Array(1600);
        this.n = 0;
      }
    }
    return true;
  }
}
registerProcessor("elderwise-capture", Capture);
`;

const RECONNECT_TRIES = 3;
// Live models sometimes call the tool twice for one question; the repeat reuses the first answer.
const REPEAT_WINDOW_MS = 30_000;

type Conversation = {
  opts: LiveOptions;
  session: Session | null;
  model: string;
  // Latest session resumption handle: a dropped connection continues the same conversation.
  resume?: string;
  reconnecting: boolean;
  lastAsk?: { question: string; at: number; answer: Promise<{ headline: string; sentence: string }> };
  mic: MediaStream;
  input: AudioContext;
  output: AudioContext;
  micMeter: AnalyserNode;
  outMeter: AnalyserNode;
  speaker: GainNode;
  playhead: number;
  playing: Set<AudioBufferSourceNode>;
  userTurnDone: boolean;
  stopped: boolean;
};

let convo: Conversation | null = null;

function toBase64(pcm: ArrayBuffer): string {
  const bytes = new Uint8Array(pcm);
  let s = "";
  for (let i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(s);
}

function play(c: Conversation, b64: string) {
  const bytes = Uint8Array.from(atob(b64), (ch) => ch.charCodeAt(0));
  const pcm = new Int16Array(bytes.buffer, 0, bytes.length >> 1);
  const buffer = c.output.createBuffer(1, pcm.length, 24000);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < pcm.length; i++) data[i] = pcm[i] / 0x8000;
  const src = c.output.createBufferSource();
  src.buffer = buffer;
  src.connect(c.speaker);
  c.playhead = Math.max(c.playhead, c.output.currentTime + 0.05);
  src.start(c.playhead);
  c.playhead += buffer.duration;
  c.playing.add(src);
  src.onended = () => {
    c.playing.delete(src);
    if (!c.playing.size && state.status === "speaking") set({ status: "listening", heard: "" });
  };
}

function silence(c: Conversation) {
  c.playing.forEach((s) => s.stop());
  c.playing.clear();
  c.playhead = 0;
}

function rms(meter: AnalyserNode, buf: Float32Array<ArrayBuffer>): number {
  meter.getFloatTimeDomainData(buf);
  let sum = 0;
  for (const v of buf) sum += v * v;
  return Math.sqrt(sum / buf.length);
}

const meterBuf = new Float32Array(512);

// Drives the VoiceBeam glow: the person's voice while they talk, Elderwise's voice while it answers.
export function liveLevel(): number {
  if (!convo) return 0;
  const speaking = state.status === "speaking";
  const v = rms(speaking ? convo.outMeter : convo.micMeter, meterBuf);
  return Math.min(1, v * (speaking ? 5 : 8));
}

async function handle(c: Conversation, m: LiveServerMessage) {
  if (m.sessionResumptionUpdate?.resumable && m.sessionResumptionUpdate.newHandle) c.resume = m.sessionResumptionUpdate.newHandle;
  // The server is about to close this connection: move to a fresh one now, keeping the conversation.
  if (m.goAway) reconnect(c);

  const content = m.serverContent;
  if (content?.inputTranscription?.text) {
    // Barge-in: the person talks over the answer, so stop playing it at once instead of waiting
    // for the server's "interrupted" (as Orbs does in hands-free mode).
    if (state.status === "speaking" && c.playing.size) silence(c);
    // A new person turn starts after Elderwise finished its last one.
    const heard = c.userTurnDone ? content.inputTranscription.text : state.heard + content.inputTranscription.text;
    c.userTurnDone = false;
    set({ heard: heard.trimStart(), ...(state.status === "speaking" ? {} : { status: "listening" as const }) });
  }
  if (content?.interrupted) {
    silence(c);
    set({ status: "listening", said: "" });
  }
  for (const part of content?.modelTurn?.parts ?? []) {
    if (part.inlineData?.data) {
      play(c, part.inlineData.data);
      if (state.status !== "thinking") set({ status: "speaking" });
    }
  }
  if (content?.outputTranscription?.text) set({ said: state.said + content.outputTranscription.text });
  if (content?.turnComplete) {
    c.userTurnDone = true;
    if (!c.playing.size && state.status === "speaking") set({ status: "listening", heard: "" });
  }

  for (const call of m.toolCall?.functionCalls ?? []) {
    if (call.name !== ASK_TOOL) continue;
    const question = String(call.args?.question ?? state.heard);
    set({ status: "thinking", heard: question, said: "" });
    let response: Record<string, unknown>;
    try {
      const key = question.trim().toLowerCase();
      const last = c.lastAsk;
      const repeat = last && last.question === key && Date.now() - last.at < REPEAT_WINDOW_MS;
      if (!repeat) c.lastAsk = { question: key, at: Date.now(), answer: c.opts.ask(question) };
      const a = await c.lastAsk!.answer;
      response = { headline: a.headline, sentence: a.sentence, note: "The full card with details is now on the Answers screen." };
    } catch {
      c.lastAsk = undefined; // a failed question may be asked again
      response = { error: "The expert could not answer right now." };
    }
    if (c.stopped) return;
    c.session?.sendToolResponse({ functionResponses: [{ id: call.id, name: call.name, response }] });
    set({ status: "speaking" });
  }
}

// Opens one Live session with a fresh single-use token; resolves once Gemini is ready to listen.
async function open(c: Conversation, model: string): Promise<Session> {
  const res = await fetch("/api/live-token", { method: "POST" });
  if (!res.ok) throw new Error(`token ${res.status}`);
  const { token } = await res.json();
  const ai = new GoogleGenAI({ apiKey: token, httpOptions: { apiVersion: "v1alpha" } });
  return new Promise((resolve, reject) => {
    let ready = false;
    let session: Session | null = null;
    const timer = setTimeout(() => reject(new Error("setup timeout")), 10_000);
    ai.live
      .connect({
        model,
        config: liveConfig(c.opts.lang, c.opts.name, c.resume),
        callbacks: {
          onmessage: (m) => {
            if (m.setupComplete && !ready) {
              ready = true;
              clearTimeout(timer);
              // setupComplete can arrive before connect() resolves, so wait for the session object.
              queueMicrotask(function wait() {
                if (session) resolve(session);
                else setTimeout(wait, 10);
              });
              return;
            }
            // c.session is set only once open() resolves; messages arriving just before that still count.
            if (ready && (c.session === session || !c.session)) handle(c, m);
          },
          onerror: (e) => console.warn("Gemini Live error:", e.message),
          onclose: (e) => {
            clearTimeout(timer);
            if (!ready) reject(new Error(`closed ${e.code} ${e.reason}`));
            else if (c.session === session) reconnect(c);
          },
        },
      })
      .then((s) => (session = s), reject);
  });
}

// A dropped connection or goAway: open a new session with a fresh token, resuming the conversation.
async function reconnect(c: Conversation) {
  if (c.reconnecting || c.stopped) return;
  c.reconnecting = true;
  const old = c.session;
  c.session = null;
  old?.close();
  silence(c);
  set({ status: "connecting" });
  for (let i = 0; i < RECONNECT_TRIES && !c.stopped; i++) {
    try {
      c.session = await open(c, c.model);
      break;
    } catch (err) {
      console.warn("Gemini Live reconnect failed:", err);
      await new Promise((r) => setTimeout(r, 1000));
    }
  }
  c.reconnecting = false;
  if (c.stopped) c.session?.close();
  else if (c.session) set({ status: "listening" });
  else stopLive();
}

// Must be called from a tap: audio playback and the mic only unlock inside a user gesture on iOS.
export async function startLive(opts: LiveOptions): Promise<void> {
  if (convo) return;
  const input = new AudioContext({ sampleRate: 16000 });
  const output = new AudioContext({ sampleRate: 24000 });
  set({ status: "connecting", heard: "", said: "" });
  try {
    await Promise.all([input.resume(), output.resume()]);
    const mic = await navigator.mediaDevices.getUserMedia({
      audio: { channelCount: 1, echoCancellation: true, noiseSuppression: true, autoGainControl: true },
    });
    const speaker = output.createGain();
    const outMeter = output.createAnalyser();
    speaker.connect(outMeter);
    outMeter.connect(output.destination);
    const micMeter = input.createAnalyser();
    const c: Conversation = {
      opts,
      session: null,
      model: LIVE_MODELS[0],
      reconnecting: false,
      mic,
      input,
      output,
      micMeter,
      outMeter,
      speaker,
      playhead: 0,
      playing: new Set(),
      userTurnDone: true,
      stopped: false,
    };
    convo = c;

    let lastError: unknown;
    for (const model of LIVE_MODELS) {
      try {
        c.session = await open(c, model);
        c.model = model;
        break;
      } catch (err) {
        lastError = err;
        console.warn(`Gemini Live ${model} failed:`, err);
      }
    }
    if (!c.session || c.stopped) throw lastError ?? new Error("stopped");

    const url = URL.createObjectURL(new Blob([CAPTURE_WORKLET], { type: "text/javascript" }));
    await input.audioWorklet.addModule(url);
    URL.revokeObjectURL(url);
    const source = input.createMediaStreamSource(mic);
    const capture = new AudioWorkletNode(input, "elderwise-capture");
    source.connect(micMeter);
    source.connect(capture);
    capture.port.onmessage = (e: MessageEvent<ArrayBuffer>) => {
      if (!c.stopped) c.session?.sendRealtimeInput({ audio: { data: toBase64(e.data), mimeType: "audio/pcm;rate=16000" } });
    };
    set({ status: "listening" });
  } catch (err) {
    stopLive();
    input.close().catch(() => {});
    output.close().catch(() => {});
    throw err;
  }
}

export function stopLive() {
  const c = convo;
  convo = null;
  if (c) {
    c.stopped = true;
    silence(c);
    c.session?.close();
    c.mic.getTracks().forEach((t) => t.stop());
    c.input.close().catch(() => {});
    c.output.close().catch(() => {});
  }
  set(IDLE);
}
