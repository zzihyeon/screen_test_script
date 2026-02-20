import type { DuplicateGroup, FinalReport, ScenarioSignature, SimilarityEvidence, SuspiciousFinding } from "../types/core.js";

export function buildFinalReport(input: {
  signatures: ScenarioSignature[];
  duplicates: DuplicateGroup[];
  pairScores: SimilarityEvidence[];
  suspicious: SuspiciousFinding[];
}): FinalReport {
  return {
    version: "1.0.0",
    generatedAt: new Date().toISOString(),
    signatures: [...input.signatures].sort((a, b) => a.unitId.localeCompare(b.unitId)),
    duplicates: [...input.duplicates].sort((a, b) => a.groupId.localeCompare(b.groupId)),
    pairScores: [...input.pairScores].sort((a, b) => a.final - b.final),
    suspicious: [...input.suspicious].sort((a, b) => {
      const byFile = a.file.localeCompare(b.file);
      if (byFile !== 0) return byFile;
      return a.ruleId.localeCompare(b.ruleId);
    })
  };
}
