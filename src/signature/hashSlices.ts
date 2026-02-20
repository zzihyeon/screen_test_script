import type { ArgsVariant, CallFact } from "../types/core.js";
import { hash } from "../utils/hash.js";

export function hashWeightedSlices(callFacts: CallFact[], argsVariant: ArgsVariant): string {
  const weighted: string[] = [];
  for (const fact of callFacts) {
    const baseWeight = 1 + Number(fact.inLoop) + Number(fact.inBranch) + Number(fact.retryLike);
    for (let i = 0; i < baseWeight; i += 1) {
      weighted.push(`${fact.token}|a=${fact.awaited ? 1 : 0}|d=${fact.depth}`);
    }
  }
  weighted.push(`mode:${argsVariant.mode}`);
  weighted.push(`seed:${argsVariant.hasSeed ? "yes" : "no"}`);
  return hash(weighted.join("||"));
}
