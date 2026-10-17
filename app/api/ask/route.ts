import Anthropic from "@anthropic-ai/sdk";
import { ANSWER_SCHEMA, TRANSIT_TOOL, contextNote, defaultQuestion, systemPrompt, type Answer, type Lang } from "@/prompts/elderwise";

const MODEL = "claude-sonnet-5-5";
const IMAGE_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"] as const;
type ImageType = (typeof IMAGE_TYPES)[number];

const client = new Anthropic();

// Berlin public transport (BVG), free and without a key: https://v6.bvg.transport.rest
const BVG = process.env.BVG_API_URL ?? "https://v6.bvg.transport.rest";
const MAX_TOOL_ROUNDS = 3;

type Stop = { id: string; name: string };
type Line = { name?: string } | null;
type Departure = { when: string | null; plannedWhen: string | null; delay: number | null; direction: string; line: Line; platform: string | null };
type Leg = { origin: Stop; destination: Stop; departure: string; arrival: string; line?: Line; direction?: string; walking?: boolean; distance?: number };

async function bvg<T>(path: string): Promise<T> {
  const res = await fetch(`${BVG}${path}`, { signal: AbortSignal.timeout(8000) });
  if (!res.ok) throw new Error(`BVG ${res.status}`);
  return res.json() as Promise<T>;
}

async function findStop(query: string): Promise<Stop> {
  const found = await bvg<Stop[]>(`/locations?query=${encodeURIComponent(query)}&results=1&addresses=false&poi=false`);
  if (!found[0]?.id) throw new Error(`No stop found for "${query}"`);
  return found[0];
}

const clock = (iso: string | null) =>
  iso ? new Date(iso).toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit", timeZone: "Europe/Berlin" }) : "?";

// Looks up live departures (or a trip when "to" is given) and returns short plain text for Claude.
async function berlinTransit(input: { from?: string; to?: string }): Promise<string> {
  const from = await findStop(String(input.from ?? ""));
  if (input.to) {
    const to = await findStop(String(input.to));
    const { journeys } = await bvg<{ journeys: { legs: Leg[] }[] }>(
      `/journeys?from=${from.id}&to=${to.id}&results=2&stopovers=false&remarks=false`,
    );
    const trips = journeys.map((j, i) =>
      [
        `Trip ${i + 1}:`,
        ...j.legs.map((l) =>
          l.walking
            ? `- walk${l.distance ? ` ${l.distance} m` : ""} from ${l.origin.name} to ${l.destination.name}`
            : `- ${clock(l.departure)} ${l.line?.name ?? "?"} towards ${l.direction ?? "?"} from ${l.origin.name}, get off at ${l.destination.name} (${clock(l.arrival)})`,
        ),
      ].join("\n"),
    );
    return [`Trips from ${from.name} to ${to.name}:`, ...trips].join("\n");
  }
  const { departures } = await bvg<{ departures: Departure[] }>(`/stops/${from.id}/departures?duration=30&results=5&remarks=false`);
  const now = Date.now();
  const rows = departures.map((d) => {
    const mins = d.when ? Math.max(0, Math.round((new Date(d.when).getTime() - now) / 60000)) : null;
    const late = d.delay && d.delay >= 60 ? `, ${Math.round(d.delay / 60)} min late` : "";
    return `- ${d.line?.name ?? "?"} towards ${d.direction}: ${clock(d.when ?? d.plannedWhen)}${mins !== null ? ` (in ${mins} min)` : " (cancelled?)"}${late}${d.platform ? `, platform ${d.platform}` : ""}`;
  });
  if (rows.length === 0) rows.push("- none in the next 30 minutes");
  return [`Next departures at ${from.name} (time now ${clock(new Date().toISOString())}):`, ...rows].join("\n");
}

function field(form: FormData, key: string, fallback: string, max = 200): string {
  return String(form.get(key) ?? "").trim().slice(0, max) || fallback;
}

export async function POST(req: Request) {
  const form = await req.formData();
  const lang: Lang = form.get("lang") === "de" ? "de" : "en";
  const question = field(form, "question", defaultQuestion(lang), 2000);
  const image = form.get("image");

  const content: Anthropic.Beta.BetaContentBlockParam[] = [];
  if (image instanceof File && image.size > 0) {
    if (!IMAGE_TYPES.includes(image.type as ImageType)) {
      return Response.json({ error: "unsupported_image" }, { status: 400 });
    }
    const data = Buffer.from(await image.arrayBuffer()).toString("base64");
    content.push({ type: "image", source: { type: "base64", media_type: image.type as ImageType, data } });
  }
  const note = contextNote({
    name: field(form, "name", "Ingrid"),
    trustedName: field(form, "trustedName", "Anna"),
    trustedRelation: field(form, "trustedRelation", "daughter"),
    today: field(form, "today", new Date().toDateString()),
  });
  content.push({ type: "text", text: `${note}\n\nQuestion: ${question}` });

  try {
    const messages: Anthropic.Beta.BetaMessageParam[] = [{ role: "user", content }];
    const ask = () =>
      client.beta.messages.create({
        model: MODEL,
        max_tokens: 2000,
        betas: ["server-side-fallback-2026-07-01"],
        fallbacks: "default",
        system: systemPrompt(lang),
        tools: [TRANSIT_TOOL],
        output_config: { effort: "low", format: { type: "json_schema", schema: ANSWER_SCHEMA } },
        messages,
      });

    // Tool loop: Claude may look up Berlin transport, then writes the JSON answer.
    let response = await ask();
    for (let round = 0; response.stop_reason === "tool_use" && round < MAX_TOOL_ROUNDS; round++) {
      const results: Anthropic.Beta.BetaToolResultBlockParam[] = [];
      for (const block of response.content) {
        if (block.type !== "tool_use") continue;
        try {
          results.push({ type: "tool_result", tool_use_id: block.id, content: await berlinTransit(block.input as { from?: string; to?: string }) });
        } catch (err) {
          console.error("Transit lookup failed:", err);
          results.push({ type: "tool_result", tool_use_id: block.id, is_error: true, content: "The timetable could not be checked right now." });
        }
      }
      messages.push({ role: "assistant", content: response.content }, { role: "user", content: results });
      response = await ask();
    }

    if (response.stop_reason === "refusal") {
      return Response.json({ error: "refusal" }, { status: 422 });
    }
    const text = response.content.find((b) => b.type === "text");
    if (!text || text.type !== "text") {
      return Response.json({ error: "empty" }, { status: 502 });
    }
    const answer: Answer = JSON.parse(text.text);
    answer.points = answer.points.slice(0, 3);
    answer.steps = (answer.steps ?? []).slice(0, 5);
    if (answer.fields) answer.fields = answer.fields.slice(0, 5);
    return Response.json(answer);
  } catch (err) {
    console.error("Claude request failed:", err);
    return Response.json({ error: "api" }, { status: 502 });
  }
}
