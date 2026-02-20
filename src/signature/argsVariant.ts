import type { ArgsVariant, ModeClass } from "../types/core.js";

function pickMode(kv: Record<string, string | boolean>): ModeClass {
  const mode = kv.mode ?? kv.m;
  if (typeof mode === "string") {
    const normalized = mode.toLowerCase();
    if (normalized.includes("seq")) {
      return "seq";
    }
    if (normalized.includes("random") || normalized.includes("rand")) {
      return "random";
    }
  }
  return "unknown";
}

export function parseArgsVariant(args: string[]): ArgsVariant {
  const kv: Record<string, string | boolean> = {};
  for (let i = 0; i < args.length; i += 1) {
    const part = args[i];
    if (!part.startsWith("-")) {
      continue;
    }
    if (part.startsWith("--")) {
      const trimmed = part.slice(2);
      const eq = trimmed.indexOf("=");
      if (eq >= 0) {
        kv[trimmed.slice(0, eq)] = trimmed.slice(eq + 1);
      } else {
        const next = args[i + 1];
        if (next && !next.startsWith("-")) {
          kv[trimmed] = next;
          i += 1;
        } else {
          kv[trimmed] = true;
        }
      }
      continue;
    }
    const short = part.slice(1);
    const next = args[i + 1];
    if (next && !next.startsWith("-")) {
      kv[short] = next;
      i += 1;
    } else {
      kv[short] = true;
    }
  }
  const seedValue = kv.seed ?? kv.s;
  const seed = typeof seedValue === "string" ? seedValue : undefined;
  return {
    rawArgs: args,
    kv,
    mode: pickMode(kv),
    seed,
    hasSeed: typeof seed === "string"
  };
}
