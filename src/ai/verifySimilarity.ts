import type { ScenarioSignature, SimilarityEvidence, ToolConfig } from "../types/core.js";
import { requestAiSimilarity } from "./client.js";

interface PairRef {
  left: ScenarioSignature;
  right: ScenarioSignature;
  index: number;
}

export async function applyAiVerification(
  signatures: ScenarioSignature[],
  pairScores: SimilarityEvidence[],
  config: ToolConfig
): Promise<void> {
  const ai = config.aiVerification;
  if (!ai.enabled || !ai.endpoint) {
    return;
  }

  const byUnit = new Map<string, ScenarioSignature>(signatures.map((s) => [s.unitId, s]));
  const candidates: PairRef[] = [];
  for (let i = 0; i < pairScores.length; i += 1) {
    const pair = pairScores[i];
    if (pair.baseFinal < ai.minCandidateScore) continue;
    const left = byUnit.get(pair.leftUnit);
    const right = byUnit.get(pair.rightUnit);
    if (!left || !right) continue;
    candidates.push({ left, right, index: i });
  }
  candidates.sort((a, b) => pairScores[b.index].baseFinal - pairScores[a.index].baseFinal);
  const limited = candidates.slice(0, ai.maxPairs);

  for (const candidate of limited) {
    const pair = pairScores[candidate.index];
    try {
      const result = await requestAiSimilarity({
        left: candidate.left,
        right: candidate.right,
        endpoint: ai.endpoint,
        token: ai.token,
        model: ai.model,
        timeoutMs: ai.timeoutMs
      });
      pair.aiScore = result.score;
      pair.aiReason = result.reason;
      pair.final = Math.max(
        0,
        Math.min(1, (1 - ai.blendWeight) * pair.baseFinal + ai.blendWeight * result.score)
      );
      pair.reasons = [...pair.reasons, "ai-verified"];
    } catch (error) {
      pair.reasons = [...pair.reasons, `ai-error:${(error as Error).message}`];
    }
  }
}
