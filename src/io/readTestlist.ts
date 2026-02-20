import { readFile } from "node:fs/promises";
import path from "node:path";
import { z } from "zod";
import type { TestListItem } from "../types/core.js";

const testlistSchema = z.array(
  z.object({
    file: z.string().min(1),
    args: z.array(z.string()).default([])
  })
);

export async function readTestlist(testlistPath: string, root: string): Promise<TestListItem[]> {
  const raw = await readFile(testlistPath, "utf8");
  const parsed = testlistSchema.parse(JSON.parse(raw));
  return parsed.map((item) => ({
    file: path.resolve(root, item.file),
    args: item.args
  }));
}
