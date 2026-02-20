import type { AnalysisUnitContext, SuspiciousFinding, ToolConfig } from "../types/core.js";
import { ruleHardcodedSleep } from "./rules/hardcodedSleep.js";
import { ruleMissingAwait } from "./rules/missingAwait.js";
import { ruleModeMismatch } from "./rules/modeMismatch.js";
import { ruleRandomWithoutSeed } from "./rules/randomWithoutSeed.js";
import { ruleUnhandledErrors } from "./rules/unhandledErrors.js";
import { ruleUnreachableCalls } from "./rules/unreachableCalls.js";
import { ruleUnusedArgs } from "./rules/unusedArgs.js";

export type HeuristicRule = (ctx: AnalysisUnitContext) => SuspiciousFinding[];

const allRules: Record<string, HeuristicRule> = {
  missingAwait: ruleMissingAwait,
  randomWithoutSeed: ruleRandomWithoutSeed,
  hardcodedSleep: ruleHardcodedSleep,
  unhandledErrors: ruleUnhandledErrors,
  modeMismatch: ruleModeMismatch,
  unreachableCalls: ruleUnreachableCalls,
  unusedArgs: ruleUnusedArgs
};

export function runHeuristics(ctx: AnalysisUnitContext, config: ToolConfig): SuspiciousFinding[] {
  const findings: SuspiciousFinding[] = [];
  for (const [ruleId, rule] of Object.entries(allRules)) {
    const conf = config.rules[ruleId];
    if (!conf?.enabled) continue;
    const ruleFindings = rule(ctx).map((f) => ({
      ...f,
      severity: conf.severity
    }));
    findings.push(...ruleFindings);
  }
  return findings;
}
