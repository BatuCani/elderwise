// The real-time voice (Gemini Live) only talks. Claude, behind the ask_elderwise tool, is the brain.
import { Modality, Type, type LiveConnectConfig } from "@google/genai";
import type { Lang } from "./elderwise";

export const LIVE_MODELS = ["gemini-3.1-flash-live-preview", "gemini-2.5-flash-native-audio-latest"] as const;

export const ASK_TOOL = "ask_elderwise";

function instruction(lang: Lang, name: string): string {
  const language = lang === "de" ? "simple German, addressing the person formally with Sie" : "simple English";
  return `You are the warm, patient voice of Elderwise, a helper for older adults. You are talking with ${name}.
Speak in ${language}. Talk slowly and kindly, in short sentences, like a caring friend.

For every real question or request (a letter, a message, a photo, medicine, money, an appointment, a phone or computer, how to use AI),
always call ${ASK_TOOL} first with the question in the person's own words. Set has_photo to true if they mention showing you something.
While you wait, you may say one short calm phrase like "Let me look at that."
Then say the answer from ${ASK_TOOL} in your own warm words, staying close to its meaning. Never add facts, numbers or advice it did not give.
Mention that the details are on the Answers screen. If the tool reports an error, say sorry and ask them to try again.

Only answer greetings, thanks and small talk yourself, in one short sentence. Never give medical, legal or money advice on your own.`;
}

export function liveConfig(lang: Lang, name: string): LiveConnectConfig {
  return {
    responseModalities: [Modality.AUDIO],
    systemInstruction: instruction(lang, name),
    inputAudioTranscription: {},
    outputAudioTranscription: {},
    tools: [
      {
        functionDeclarations: [
          {
            name: ASK_TOOL,
            description: "Ask the Elderwise expert (Claude) the person's question. It also sees the photo they showed, if any.",
            parameters: {
              type: Type.OBJECT,
              properties: {
                question: { type: Type.STRING, description: "The person's question in their own words." },
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
