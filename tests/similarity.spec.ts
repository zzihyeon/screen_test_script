import { describe, expect, test } from "vitest";
import { similarityEvidence } from "../src/similarity/aggregateScore.js";

describe("similarity", () => {
  test("scores high for near-identical signatures", () => {
    const a = {
      unitId: "a",
      file: "a.js",
      argsVariant: { rawArgs: [], kv: {}, mode: "seq", hasSeed: true, seed: "1" },
      callSequence: ["x#a", "x#b"],
      callSet: ["x#a", "x#b"],
      cfHints: [],
      astHash: "abcdef",
      parseWarnings: []
    } as any;
    const b = {
      ...a,
      unitId: "b"
    } as any;
    const ev = similarityEvidence(a, b, { set: 0.35, sequence: 0.35, ast: 0.2, variant: 0.1 });
    expect(ev.final).toBeGreaterThan(0.95);
  });
});
