import type { AnalysisUnitContext, SuspiciousFinding } from "../../types/core.js";

export function ruleHardcodedSleep(ctx: AnalysisUnitContext): SuspiciousFinding[] {
  return ctx.callFacts
    .filter((fact) => {
      const callee = fact.callee.toLowerCase();
      return callee.includes("sleep") || callee.includes("timeout") || callee.includes("wait");
    })
    .map<SuspiciousFinding>((fact) => ({
      file: ctx.unit.file,
      unitId: ctx.unit.unitId,
      ruleId: "hardcodedSleep",
      severity: "warn",
      message: `Potential hard-coded delay call: ${fact.callee}`,
      confidence: 0.8,
      loc: fact.loc
    }));
}
