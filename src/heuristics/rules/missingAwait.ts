import type { AnalysisUnitContext, SuspiciousFinding } from "../../types/core.js";

const ASYNC_NAME_HINTS = ["run", "execute", "start", "tool", "fetch"];

export function ruleMissingAwait(ctx: AnalysisUnitContext): SuspiciousFinding[] {
  return ctx.callFacts
    .filter((fact) => !fact.awaited && ASYNC_NAME_HINTS.some((hint) => fact.callee.toLowerCase().includes(hint)))
    .map<SuspiciousFinding>((fact) => ({
      file: ctx.unit.file,
      unitId: ctx.unit.unitId,
      ruleId: "missingAwait",
      severity: "warn",
      message: `Potential async tool call without await: ${fact.token}`,
      confidence: 0.7,
      loc: fact.loc
    }));
}
