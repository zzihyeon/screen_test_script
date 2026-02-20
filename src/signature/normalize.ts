import type { CallFact } from "../types/core.js";

export function normalizeSequence(facts: CallFact[]): string[] {
  return facts.map((fact) => fact.token);
}

export function uniqueSorted(tokens: string[]): string[] {
  return [...new Set(tokens)].sort((a, b) => a.localeCompare(b));
}

export function extractControlFlowHints(facts: CallFact[]): string[] {
  const hints = new Set<string>();
  for (const fact of facts) {
    if (fact.awaited) hints.add("awaited");
    if (fact.inLoop) hints.add("loop");
    if (fact.inBranch) hints.add("branch");
    if (fact.retryLike) hints.add("retry");
    if (fact.depth > 4) hints.add("deep-nesting");
  }
  return [...hints].sort((a, b) => a.localeCompare(b));
}
