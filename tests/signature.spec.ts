import { describe, expect, test } from "vitest";
import { parseArgsVariant } from "../src/signature/argsVariant.js";
import { extractControlFlowHints, normalizeSequence, uniqueSorted } from "../src/signature/normalize.js";

describe("signature helpers", () => {
  test("parses args variant", () => {
    const parsed = parseArgsVariant(["--mode=seq", "--seed", "42"]);
    expect(parsed.mode).toBe("seq");
    expect(parsed.hasSeed).toBe(true);
    expect(parsed.seed).toBe("42");
  });

  test("normalizes sequence and call set", () => {
    const facts = [
      { token: "a#x", awaited: true, inLoop: false, inBranch: false, retryLike: false, depth: 1 },
      { token: "a#x", awaited: false, inLoop: true, inBranch: false, retryLike: false, depth: 2 }
    ] as any[];
    expect(normalizeSequence(facts)).toEqual(["a#x", "a#x"]);
    expect(uniqueSorted(["b", "a", "a"])).toEqual(["a", "b"]);
    expect(extractControlFlowHints(facts)).toContain("loop");
  });
});
