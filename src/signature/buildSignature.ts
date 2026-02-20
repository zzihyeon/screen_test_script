import type { AnalysisUnitContext, ScenarioSignature } from "../types/core.js";
import { extractControlFlowHints, normalizeSequence, uniqueSorted } from "./normalize.js";
import { hashWeightedSlices } from "./hashSlices.js";

export function buildScenarioSignature(ctx: AnalysisUnitContext): ScenarioSignature {
  const callSequence = normalizeSequence(ctx.callFacts);
  const callSet = uniqueSorted(callSequence);
  const cfHints = extractControlFlowHints(ctx.callFacts);
  const astHash = hashWeightedSlices(ctx.callFacts, ctx.unit.argsVariant);
  return {
    unitId: ctx.unit.unitId,
    file: ctx.unit.file,
    argsVariant: ctx.unit.argsVariant,
    callSequence,
    callSet,
    cfHints,
    astHash,
    parseWarnings: ctx.parseWarnings
  };
}
