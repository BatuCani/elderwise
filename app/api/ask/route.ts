import Anthropic from "@anthropic-ai/sdk";
import { ANSWER_SCHEMA, defaultQuestion, systemPrompt, type Lang } from "@/prompts/elderwise";

const MODEL = "claude-sonnet-5-5";
const IMAGE_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"] as const;
type ImageType = (typeof IMAGE_TYPES)[number];

const client = new Anthropic();

export async function POST(req: Request) {
  const form = await req.formData();
  const lang: Lang = form.get("lang") === "en" ? "en" : "de";
  const question = String(form.get("question") ?? "").trim() || defaultQuestion(lang);
  const image = form.get("image");

  const content: Anthropic.Beta.BetaContentBlockParam[] = [];
  if (image instanceof File && image.size > 0) {
    if (!IMAGE_TYPES.includes(image.type as ImageType)) {
      return Response.json({ error: "unsupported_image" }, { status: 400 });
    }
    const data = Buffer.from(await image.arrayBuffer()).toString("base64");
    content.push({ type: "image", source: { type: "base64", media_type: image.type as ImageType, data } });
  }
  content.push({ type: "text", text: question });

  try {
    const response = await client.beta.messages.create({
      model: MODEL,
      max_tokens: 2000,
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
      system: systemPrompt(lang),
      output_config: { effort: "low", format: { type: "json_schema", schema: ANSWER_SCHEMA } },
      messages: [{ role: "user", content }],
    });

    if (response.stop_reason === "refusal") {
      return Response.json({ error: "refusal" }, { status: 422 });
    }
    const text = response.content.find((b) => b.type === "text");
    if (!text || text.type !== "text") {
      return Response.json({ error: "empty" }, { status: 502 });
    }
    return Response.json(JSON.parse(text.text));
  } catch (err) {
    console.error("Claude request failed:", err);
    return Response.json({ error: "api" }, { status: 502 });
  }
}
