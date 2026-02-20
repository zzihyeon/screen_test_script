import { createHash } from "node:crypto";

export function stableStringify(input: unknown): string {
  return JSON.stringify(sortRecursively(input));
}

export function hash(input: string): string {
  return createHash("sha1").update(input).digest("hex");
}

function sortRecursively(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map((item) => sortRecursively(item));
  }
  if (value && typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>).sort(([a], [b]) =>
      a.localeCompare(b)
    );
    const out: Record<string, unknown> = {};
    for (const [k, v] of entries) {
      out[k] = sortRecursively(v);
    }
    return out;
  }
  return value;
}
