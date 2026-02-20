import * as t from "@babel/types";
import type { CallExpression, File, OptionalCallExpression } from "@babel/types";
import type { NodePath } from "@babel/traverse";
import { traverse } from "../parser/traverse.js";
import type { CallFact, ImportMap, SourceLoc } from "../types/core.js";

const BRANCH_NODES = new Set(["IfStatement", "ConditionalExpression", "SwitchStatement"]);
const LOOP_NODES = new Set([
  "ForStatement",
  "ForInStatement",
  "ForOfStatement",
  "WhileStatement",
  "DoWhileStatement"
]);

function toLoc(loc: t.SourceLocation | null | undefined): SourceLoc | undefined {
  if (!loc) {
    return undefined;
  }
  return { line: loc.start.line, column: loc.start.column };
}

function calleeName(node: CallExpression | OptionalCallExpression): string {
  const callee = node.callee;
  if (t.isIdentifier(callee)) {
    return callee.name;
  }
  if (t.isMemberExpression(callee) && t.isIdentifier(callee.property)) {
    return callee.property.name;
  }
  if (t.isOptionalMemberExpression(callee) && t.isIdentifier(callee.property)) {
    return callee.property.name;
  }
  return "anonymousCall";
}

function resolveSource(node: CallExpression | OptionalCallExpression, importMap: ImportMap): string {
  const callee = node.callee;
  if (t.isIdentifier(callee)) {
    const binding = importMap.bindings.get(callee.name);
    return binding?.source ?? "local";
  }
  if (t.isMemberExpression(callee) && t.isIdentifier(callee.object)) {
    const binding = importMap.bindings.get(callee.object.name);
    return binding?.source ?? "local";
  }
  if (t.isOptionalMemberExpression(callee) && t.isIdentifier(callee.object)) {
    const binding = importMap.bindings.get(callee.object.name);
    return binding?.source ?? "local";
  }
  return "local";
}

function isRetryLike(path: NodePath): boolean {
  const parentFn = path.getFunctionParent();
  if (!parentFn || !("node" in parentFn)) {
    return false;
  }
  if (t.isFunctionDeclaration(parentFn.node) || t.isFunctionExpression(parentFn.node)) {
    return (parentFn.node.id?.name ?? "").toLowerCase().includes("retry");
  }
  if (t.isArrowFunctionExpression(parentFn.node)) {
    const parent = parentFn.parentPath?.node;
    if (t.isVariableDeclarator(parent) && t.isIdentifier(parent.id)) {
      return parent.id.name.toLowerCase().includes("retry");
    }
  }
  return false;
}

function isAwaited(path: NodePath<t.CallExpression | t.OptionalCallExpression>): boolean {
  const parent = path.parentPath?.node;
  return Boolean(parent && t.isAwaitExpression(parent));
}

function shouldTrack(node: CallExpression | OptionalCallExpression, source: string): boolean {
  if (source !== "local") {
    return true;
  }
  const name = calleeName(node).toLowerCase();
  return (
    name.includes("tool") ||
    name.includes("sleep") ||
    name.includes("wait") ||
    name.includes("random") ||
    name.includes("retry")
  );
}

export function extractCallFacts(ast: File | null, importMap: ImportMap): CallFact[] {
  if (!ast) {
    return [];
  }

  const calls: CallFact[] = [];
  traverse(ast, {
    "CallExpression|OptionalCallExpression"(path: NodePath) {
      const node = path.node;
      if (!t.isCallExpression(node) && !t.isOptionalCallExpression(node)) {
        return;
      }
      const source = resolveSource(node, importMap);
      if (!shouldTrack(node, source)) {
        return;
      }
      const token = `${source}#${calleeName(node)}`;
      const ancestors = path.getAncestry().map((it) => it.node.type);
      const inBranch = ancestors.some((type) => BRANCH_NODES.has(type));
      const inLoop = ancestors.some((type) => LOOP_NODES.has(type));
      const depth = ancestors.filter((type) => type.endsWith("Statement")).length;
      calls.push({
        token,
        source,
        callee: calleeName(node),
        awaited: isAwaited(path as NodePath<t.CallExpression | t.OptionalCallExpression>),
        inLoop,
        inBranch,
        retryLike: isRetryLike(path),
        depth,
        loc: toLoc(node.loc)
      });
    }
  });

  return calls;
}
