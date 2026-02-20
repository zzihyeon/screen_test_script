import { readFile } from "node:fs/promises";
import { DEFAULT_CONFIG } from "./defaults.js";
import { toolConfigSchema } from "./schema.js";
import type { ToolConfig } from "../types/core.js";

type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends Record<string, unknown> ? DeepPartial<T[K]> : T[K];
};

function mergeConfig(base: ToolConfig, override: DeepPartial<ToolConfig>): ToolConfig {
  const mergedRules: ToolConfig["rules"] = { ...base.rules };
  if (override.rules) {
    for (const [ruleId, rule] of Object.entries(override.rules)) {
      if (rule) {
        mergedRules[ruleId] = rule as ToolConfig["rules"][string];
      }
    }
  }

  return {
    ...base,
    ...override,
    weights: {
      ...base.weights,
      ...(override.weights ?? {})
    },
    aiVerification: {
      ...base.aiVerification,
      ...(override.aiVerification ?? {})
    },
    rules: mergedRules
  };
}

export async function loadConfig(configPath?: string): Promise<ToolConfig> {
  if (!configPath) {
    return DEFAULT_CONFIG;
  }
  const raw = await readFile(configPath, "utf8");
  const parsed = JSON.parse(raw) as DeepPartial<ToolConfig>;
  const merged = mergeConfig(DEFAULT_CONFIG, parsed);
  return toolConfigSchema.parse(merged);
}
