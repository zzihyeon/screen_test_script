import { readFile } from "node:fs/promises";
import { parse } from "@babel/parser";
import type { ParseArtifact } from "../types/core.js";

export async function parseFileBestEffort(filePath: string): Promise<ParseArtifact> {
  const warnings: string[] = [];
  let source = "";
  try {
    source = await readFile(filePath, "utf8");
  } catch (error) {
    return {
      ast: null,
      warnings: [`read_error: ${(error as Error).message}`]
    };
  }

  try {
    const ast = parse(source, {
      sourceType: "unambiguous",
      sourceFilename: filePath,
      errorRecovery: true,
      plugins: [
        "typescript",
        "jsx",
        "classProperties",
        "classPrivateProperties",
        "classPrivateMethods",
        "dynamicImport",
        "optionalChaining",
        "nullishCoalescingOperator",
        "topLevelAwait"
      ]
    });

    const errors = (ast.errors ?? []).map((err) => `parse_recovery: ${err.message}`);
    warnings.push(...errors);
    return { ast, warnings };
  } catch (error) {
    warnings.push(`parse_error: ${(error as Error).message}`);
    return { ast: null, warnings };
  }
}
