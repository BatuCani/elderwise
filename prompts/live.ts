// The real-time voice (Gemini Live) only talks. Claude, behind the ask_elderwise tool, is the brain.
// Voice rules adapted from our earlier hackathon project Orbs (github.com/Orb-agent/micro-intent, backend/agent.py).
import { Modality, Type, type LiveConnectConfig } from "@google/genai";
import type { Lang } from "./elderwise";

// Gemini 3.8 Live first; 3.1 Flash Live only as automatic fallback.
export const LIVE_MODELS = ["gemini-3.8-live", "gemini-3.1-flash-live-preview"] as const;

export const ASK_TOOL = "ask_elderwise";

function instruction(lang: Lang, name: string): string {
  const language = lang === "de" ? "simple German, addressing the person formally with Sie" : "simple English";
  return `You are the warm, patient voice of Grace, a helper for older adults. You are talking with ${name}.
Speak in ${language}, or in the language the person speaks. Talk slowly and kindly, like a caring friend.

Say less, show more: one or two short sentences, at most about 25 words, no lists. The Answers screen carries the details.
Say times, dates and amounts the way people speak them.

For every real question or request (a letter, a message, a photo, medicine, money, an appointment, a phone or computer, how to use AI),
always call ${ASK_TOOL} first with the question in the person's own words.
This includes follow-ups and simple yes-or-no questions: you never answer a question from your own knowledge.
The expert does not hear the conversation, so make the question stand on its own: for a follow-up, say what "it" or "this" refers to from earlier.
Set has_photo to true if they mention showing you something, or if they ask about what the camera shows.
The person may share their camera live. You see it, and the expert gets the latest camera picture with the question,
so questions about what they point at ("What does this sign say?", "Which button do I press?") also go to ${ASK_TOOL}.
While you wait, you may say one short calm phrase like "Let me look at that."
Then say the answer from ${ASK_TOOL} in your own warm words, staying close to its meaning. Never add facts, numbers or advice it did not give.
Mention that the details are on the Answers screen. If the tool reports an error, say sorry and ask them to try again.

If a question is unclear, ask what they mean right away, without calling the tool.
Speech recognition mishears names and places; read odd words as the name that sounds alike.
Only answer greetings and thanks yourself, in one short sentence. Never ask how they feel and never add small talk: answer, then stop.
Never give medical, legal or money advice on your own.
You cannot send, book, buy, call or change anything for them. If asked, say so in a few words and suggest their trusted person.`;
}

// `resume` continues an earlier session (after a dropped connection or a server goAway).
export function liveConfig(lang: Lang, name: string, resume?: string): LiveConnectConfig {
  return {
    responseModalities: [Modality.AUDIO],
    sessionResumption: resume ? { handle: resume } : {},
    // Long conversations: drop the oldest turns instead of ending the session at the context limit.
    contextWindowCompression: { slidingWindow: {} },
    systemInstruction: instruction(lang, name),
    inputAudioTranscription: {},
    outputAudioTranscription: {},
    tools: [
      {
        functionDeclarations: [
          {
            name: ASK_TOOL,
            description: "Ask the Grace expert (Claude) the person's question. It also sees the photo they showed, if any.",
            parameters: {
              type: Type.OBJECT,
              properties: {
                question: { type: Type.STRING, description: "The person's question in their own words, understandable on its own (include what a follow-up refers to)." },
                has_photo: { type: Type.BOOLEAN, description: "True if the person mentions showing a photo or document." },
              },
              required: ["question", "has_photo"],
            },
          },
        ],
      },
    ],
  };
}
