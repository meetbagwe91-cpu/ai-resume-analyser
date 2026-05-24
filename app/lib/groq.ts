const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY as string;
if (!GROQ_API_KEY) throw new Error("Missing env var: VITE_GROQ_API_KEY — add it to your .env file.");
const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";

/**
 * Query the Groq API.
 *
 * Model guidance:
 *  - "llama-3.1-8b-instant"   → fast analysis (default)
 *  - "llama-3.3-70b-versatile" → high-quality rewrite / optimization
 *
 * max_tokens guidance:
 *  - Analysis call  → 1200  (5 sections × ~50 tokens/tip × 3 tips + overhead)
 *  - Optimization   → 4096  (full resume rewrite needs room)
 *  - Builder        → 4096
 */
export async function queryGroq(
  systemPrompt: string,
  userMessage: string,
  model: string = "llama-3.1-8b-instant",
  timeoutMs: number = 60000,
  maxTokens: number = 1200
): Promise<string> {
  const payload = {
    model,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user",   content: userMessage   },
    ],
    temperature: 0.5,   // Lower = faster + more deterministic JSON output
    max_tokens: maxTokens,
    response_format: { type: "json_object" },
  };

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(GROQ_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    if (!response.ok) {
      const body = await response.text();
      throw new Error(`Groq API ${response.status}: ${body}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content ?? "";
  } catch (err: any) {
    if (err.name === "AbortError") {
      throw new Error("AI request timed out — please try again.");
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }
}
