import type { NodePath } from "@babel/traverse";
import type * as t from "@babel/types";
import { traverse } from "../../parser/traverse.js";
import type { AnalysisUnitContext, SuspiciousFinding } from "../../types/core.js";

export function ruleUnhandledErrors(ctx: AnalysisUnitContext): SuspiciousFinding[] {
  if (!ctx.ast) return [];
  let hasTryCatch = false;
  traverse(ctx.ast, {
    TryStatement(path: NodePath<t.TryStatement>) {
      if (path.node.handler) {
        hasTryCatch = true;
      }
    }
  });

  const riskyCalls = ctx.callFacts.filter((c) => c.callee.toLowerCase().includes("tool"));
  if (riskyCalls.length === 0 || hasTryCatch) {
    return [];
  }
  return [
    {
      file: ctx.unit.file,
      unitId: ctx.unit.unitId,
      ruleId: "unhandledErrors",
      severity: "warn",
      message: "Tool calls found without explicit try/catch handling.",
      confidence: 0.6
    }
  ];
}
