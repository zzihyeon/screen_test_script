import type { NodePath } from "@babel/traverse";
import type * as t from "@babel/types";
import { traverse } from "../../parser/traverse.js";
import type { AnalysisUnitContext, SuspiciousFinding } from "../../types/core.js";

export function ruleRandomWithoutSeed(ctx: AnalysisUnitContext): SuspiciousFinding[] {
  if (!ctx.ast) return [];
  let randomUsed = false;
  traverse(ctx.ast, {
    MemberExpression(path: NodePath<t.MemberExpression>) {
      if (path.node.object.type === "Identifier" && path.node.object.name === "Math") {
        if (path.node.property.type === "Identifier" && path.node.property.name === "random") {
          randomUsed = true;
        }
      }
    }
  });
  if (!randomUsed || ctx.unit.argsVariant.hasSeed) return [];
  return [
    {
      file: ctx.unit.file,
      unitId: ctx.unit.unitId,
      ruleId: "randomWithoutSeed",
      severity: "warn",
      message: "Randomness detected without deterministic seed argument.",
      confidence: 0.95
    }
  ];
}
