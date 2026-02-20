import type { NodePath } from "@babel/traverse";
import type * as t from "@babel/types";
import { traverse } from "../../parser/traverse.js";
import type { AnalysisUnitContext, SuspiciousFinding } from "../../types/core.js";

export function ruleUnreachableCalls(ctx: AnalysisUnitContext): SuspiciousFinding[] {
  if (!ctx.ast) return [];
  const findings: SuspiciousFinding[] = [];
  traverse(ctx.ast, {
    IfStatement(path: NodePath<t.IfStatement>) {
      if (path.node.test.type === "BooleanLiteral" && path.node.test.value === false) {
        findings.push({
          file: ctx.unit.file,
          unitId: ctx.unit.unitId,
          ruleId: "unreachableCalls",
          severity: "info",
          message: "Unreachable branch (`if (false)`) detected; tool calls inside may never execute.",
          confidence: 0.9,
          loc: path.node.loc ? { line: path.node.loc.start.line, column: path.node.loc.start.column } : undefined
        });
      }
    }
  });
  return findings;
}
