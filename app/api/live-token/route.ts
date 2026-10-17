import { GoogleGenAI } from "@google/genai";

// Hands the browser a short-lived, single-use Gemini Live token so GEMINI_API_KEY never leaves the server.
export async function POST() {
  if (!process.env.GEMINI_API_KEY) {
    return Response.json({ error: "not_configured" }, { status: 503 });
  }
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY, httpOptions: { apiVersion: "v1alpha" } });
  const now = Date.now();
  try {
    const token = await ai.authTokens.create({
      config: {
        uses: 1,
        expireTime: new Date(now + 10 * 60_000).toISOString(),
        newSessionExpireTime: new Date(now + 60_000).toISOString(),
        httpOptions: { apiVersion: "v1alpha" },
      },
    });
    return Response.json({ token: token.name }, { headers: { "Cache-Control": "no-store" } });
  } catch (err) {
    console.error("Gemini token failed:", err);
    return Response.json({ error: "token" }, { status: 502 });
  }
}
