import type { ScenarioSignature } from "../types/core.js";

export interface AiSimilarityInput {
  left: ScenarioSignature;
  right: ScenarioSignature;
  endpoint: string;
  token?: string;
  model?: string;
  timeoutMs: number;
}

export interface AiSimilarityResult {
  score: number;
  reason?: string;
  rawText: string;
}

function extractTextFromUnknownResponse(payload: unknown): string {
  if (typeof payload === "string") {
    return payload;
  }
  if (!payload || typeof payload !== "object") {
    return JSON.stringify(payload);
  }
  const obj = payload as Record<string, unknown>;
  const direct = ["text", "output", "content", "message"]
    .map((k) => obj[k])
    .find((v) => typeof v === "string");
  if (typeof direct === "string") {
    return direct;
  }
  if (Array.isArray(obj.choices) && obj.choices.length > 0) {
    const first = obj.choices[0] as Record<string, unknown>;
    const text = first?.text;
    if (typeof text === "string") return text;
    const message = first?.message as Record<string, unknown> | undefined;
    if (message && typeof message.content === "string") return message.content;
  }
  return JSON.stringify(payload);
}

function parseScoreFromText(rawText: string): { score: number; reason?: string } {
  let text = rawText.trim();
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenced?.[1]) {
    text = fenced[1].trim();
  }
  try {
    const parsed = JSON.parse(text) as Record<string, unknown>;
    const scoreValue = parsed.score;
    if (typeof scoreValue === "number") {
      return {
        score: Math.max(0, Math.min(1, scoreValue)),
        reason: typeof parsed.reason === "string" ? parsed.reason : undefined
      };
    }
  } catch {
    const numeric = text.match(/(?:score|similarity)\s*[:=]\s*([01](?:\.\d+)?)/i);
    if (numeric?.[1]) {
      return { score: Math.max(0, Math.min(1, Number(numeric[1]))) };
    }
  }
  throw new Error("AI response did not contain parseable score.");
}

export async function requestAiSimilarity(input: AiSimilarityInput): Promise<AiSimilarityResult> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), input.timeoutMs);
  try {
    const prompt = [
      "You are validating whether two test scenarios are duplicates.",
      "Return ONLY JSON with shape: {\"score\": number, \"reason\": string}.",
      "Score range: 0..1 (1 means duplicate scenario).",
      "",
      "Left scenario:",
      JSON.stringify(
        {
          file: input.left.file,
          argsVariant: input.left.argsVariant,
          callSequence: input.left.callSequence,
          callSet: input.left.callSet,
          cfHints: input.left.cfHints
        },
        null,
        2
      ),
      "",
      "Right scenario:",
      JSON.stringify(
        {
          file: input.right.file,
          argsVariant: input.right.argsVariant,
          callSequence: input.right.callSequence,
          callSet: input.right.callSet,
          cfHints: input.right.cfHints
        },
        null,
        2
      )
    ].join("\n");

    const response = await fetch(input.endpoint, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        ...(input.token ? { authorization: `Bearer ${input.token}` } : {})
      },
      body: JSON.stringify({
        model: input.model,
        prompt
      }),
      signal: controller.signal
    });
    if (!response.ok) {
      throw new Error(`AI API error (${response.status})`);
    }
    const payload = (await response.json()) as unknown;
    const rawText = extractTextFromUnknownResponse(payload);
    const parsed = parseScoreFromText(rawText);
    return {
      score: parsed.score,
      reason: parsed.reason,
      rawText
    };
  } finally {
    clearTimeout(timeout);
  }
}
