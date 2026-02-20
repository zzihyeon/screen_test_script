import type { ArgsVariant, ScenarioSignature, SimilarityEvidence, SimilarityWeights } from "../types/core.js";
import { jaccardScore } from "./jaccard.js";
import { sequenceSimilarity } from "./editDistance.js";

function astHashSimilarity(a: string, b: string): number {
  if (a === b) return 1;
  const prefix = Math.min(a.length, b.length);
  let shared = 0;
  for (let i = 0; i < prefix; i += 1) {
    if (a[i] === b[i]) shared += 1;
  }
  return shared / Math.max(a.length, b.length, 1);
}

function variantCompatibility(a: ArgsVariant, b: ArgsVariant): number {
  if (a.mode !== "unknown" && b.mode !== "unknown") {
    if (a.mode === b.mode) return 1;
    return -0.5;
  }
  if (a.hasSeed === b.hasSeed) return 0.3;
  return 0;
}

export function similarityEvidence(
  left: ScenarioSignature,
  right: ScenarioSignature,
  weights: SimilarityWeights
): SimilarityEvidence {
  const j = jaccardScore(left.callSet, right.callSet);
  const s = sequenceSimilarity(left.callSequence, right.callSequence);
  const h = astHashSimilarity(left.astHash, right.astHash);
  const v = variantCompatibility(left.argsVariant, right.argsVariant);
  const baseFinal = Math.max(
    0,
    Math.min(1, weights.set * j + weights.sequence * s + weights.ast * h + weights.variant * v)
  );

  const reasons: string[] = [];
  if (j > 0.7) reasons.push("high-call-set-overlap");
  if (s > 0.7) reasons.push("high-sequence-similarity");
  if (h > 0.8) reasons.push("high-ast-slice-hash-similarity");
  if (v < 0) reasons.push("mode-mismatch-penalty");
  return {
    leftUnit: left.unitId,
    rightUnit: right.unitId,
    jaccard: j,
    seqScore: s,
    astScore: h,
    variantScore: v,
    baseFinal,
    final: baseFinal,
    reasons
  };
}
