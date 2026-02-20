import type { AnalysisUnitContext, SuspiciousFinding } from "../../types/core.js";

export function ruleUnusedArgs(ctx: AnalysisUnitContext): SuspiciousFinding[] {
  const keys = Object.keys(ctx.unit.argsVariant.kv);
  if (keys.length === 0 || !ctx.ast) return [];
  const fileText = JSON.stringify(ctx.ast.program).toLowerCase();
  const unused = keys.filter((key) => !fileText.includes(key.toLowerCase()));
  if (unused.length === 0) return [];
  return [
    {
      file: ctx.unit.file,
      unitId: ctx.unit.unitId,
      ruleId: "unusedArgs",
      severity: "info",
      message: `Args appear unused in file logic: ${unused.join(", ")}`,
      confidence: 0.55
    }
  ];
}
