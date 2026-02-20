import { mkdtemp, readFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { describe, expect, test } from "vitest";
import { analyze } from "../src/index.js";

describe("e2e analyze", () => {
  test("writes report.json and detects duplicates", async () => {
    const root = path.resolve(".");
    const out = await mkdtemp(path.join(os.tmpdir(), "scenario-detector-"));
    const testlist = path.resolve("tests/fixtures/testlist.json");
    const report = await analyze({ root, testlist, out, md: true });
    const json = JSON.parse(await readFile(path.join(out, "report.json"), "utf8"));
    expect(Array.isArray(json.signatures)).toBe(true);
    expect(report.signatures.length).toBe(4);
  });
});
