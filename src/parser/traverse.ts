import * as babelTraverse from "@babel/traverse";
import type { File } from "@babel/types";

const traverse = ((babelTraverse as { default?: unknown }).default ?? babelTraverse) as (
  ast: File,
  visitor: unknown
) => void;

export { traverse };

export function safeTraverse(
  ast: File | null,
  visitor: unknown
): void {
  if (!ast) {
    return;
  }
  traverse(ast, visitor);
}
