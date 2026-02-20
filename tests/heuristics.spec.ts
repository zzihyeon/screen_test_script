import { describe, expect, test } from "vitest";
import { parseFileBestEffort } from "../src/parser/parseFile.js";
import { buildImportMap } from "../src/resolver/importResolver.js";
import { extractCallFacts } from "../src/extract/callExtractor.js";
import { parseArgsVariant } from "../src/signature/argsVariant.js";
import { runHeuristics } from "../src/heuristics/engine.js";
import { DEFAULT_CONFIG } from "../src/config/defaults.js";

describe("heuristics", () => {
  test("flags random without seed and missing await", async () => {
    const file = new URL("./fixtures/project/testRandomNoSeed.js", import.meta.url).pathname;
    const parsed = await parseFileBestEffort(file);
    const importMap = buildImportMap(parsed.ast);
    const callFacts = extractCallFacts(parsed.ast, importMap);
    const findings = runHeuristics(
      {
        unit: { unitId: "u1", file, args: ["--mode=random"], argsVariant: parseArgsVariant(["--mode=random"]) },
        ast: parsed.ast,
        importMap,
        callFacts,
        parseWarnings: parsed.warnings
      },
      DEFAULT_CONFIG
    );
    expect(findings.some((f) => f.ruleId === "randomWithoutSeed")).toBe(true);
  });
});
