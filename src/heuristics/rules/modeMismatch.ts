import type { NodePath } from "@babel/traverse";
import type * as t from "@babel/types";
import { traverse } from "../../parser/traverse.js";
import type { AnalysisUnitContext, SuspiciousFinding } from "../../types/core.js";

export function ruleModeMismatch(ctx: AnalysisUnitContext): SuspiciousFinding[] {
  if (!ctx.ast) return [];
  let randomHints = 0;
  traverse(ctx.ast, {
    Identifier(path: NodePath<t.Identifier>) {
      const name = path.node.name.toLowerCase();
      if (name.includes("random") || name.includes("shuffle")) {
        randomHints += 1;
      }
    }
  });
  if (ctx.unit.argsVariant.mode === "seq" && randomHints > 0) {
    return [
      {
        file: ctx.unit.file,
        unitId: ctx.unit.unitId,
        ruleId: "modeMismatch",
        severity: "error",
        message: "Args imply seq mode, but random usage indicators are present in code.",
        confidence: 0.85
      }
    ];
  }
  return [];
}
