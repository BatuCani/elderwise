import Anthropic from "@anthropic-ai/sdk";
import { ANSWER_SCHEMA, contextNote, systemPrompt, type Answer, type Lang } from "@/prompts/elderwise";

// "Listen for me": turns a live transcript of a doctor's visit into one calm answer card.
// Separate from /api/ask because a conversation is much longer than one question.
const MODEL = "claude-sonnet-5-5";
const MAX_TRANSCRIPT = 20_000;

const client = new Anthropic();

function field(form: FormData, key: string, fallback: string, max = 200): string {
  return String(form.get(key) ?? "").trim().slice(0, max) || fallback;
}

const TASK = `The text below is a live transcript of a conversation at the doctor's (or at a counter), written down by the phone's speech recognition while it happened.
It may contain recognition mistakes, and the speakers are not marked.
Sum it up so the person remembers what was said:
- headline: what the visit was about, at most 6 words.
- sentence: the single most important thing that was said.
- points: up to 3 things the person should do or remember, keeping the meaning of what was said.
- If a next appointment or a date is mentioned, use type "reminder" and put it in "when" exactly as said. Otherwise use type "steps", or "explain" if there is nothing to do.
- Only use what is in the transcript. Never add medical advice, doses, diagnoses or numbers that were not said.
- If something important is unclear or may be misheard, say so in one point and suggest calling the doctor's office to check.
- action: offer to tell their trusted person only if the visit sounds worrying, otherwise null.
- learned: one sentence that the person just let AI write along and sum up a conversation, and can do this at any appointment.
- fields: an empty list. place and link: null.`;

export async function POST(req: Request) {
  const form = await req.formData();
  const lang: Lang = form.get("lang") === "de" ? "de" : "en";
  const transcript = String(form.get("transcript") ?? "").trim().slice(-MAX_TRANSCRIPT);
  if (transcript.length < 10) {
    return Response.json({ error: "too_short" }, { status: 400 });
  }
  const note = contextNote({
    name: field(form, "name", "Ingrid"),
    trustedName: field(form, "trustedName", "Anna"),
    trustedRelation: field(form, "trustedRelation", "daughter"),
    today: field(form, "today", new Date().toDateString()),
  });

  try {
    const response = await client.beta.messages.create({
      model: MODEL,
      max_tokens: 2000,
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
      system: systemPrompt(lang),
      output_config: { effort: "low", format: { type: "json_schema", schema: ANSWER_SCHEMA } },
      messages: [{ role: "user", content: `${note}\n\n${TASK}\n\n<transcript>\n${transcript}\n</transcript>` }],
    });

    if (response.stop_reason === "refusal") {
      return Response.json({ error: "refusal" }, { status: 422 });
    }
    const text = response.content.find((b) => b.type === "text");
    if (!text || text.type !== "text") {
      return Response.json({ error: "empty" }, { status: 502 });
    }
    const answer: Answer = JSON.parse(text.text);
    answer.points = answer.points.slice(0, 3);
    if (answer.fields) answer.fields = answer.fields.slice(0, 5);
    return Response.json(answer);
  } catch (err) {
    console.error("Claude request failed:", err);
    return Response.json({ error: "api" }, { status: 502 });
  }
}
