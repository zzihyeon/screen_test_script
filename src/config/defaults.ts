import type { ToolConfig } from "../types/core.js";

export const DEFAULT_CONFIG: ToolConfig = {
  duplicateThreshold: 0.82,
  nearDuplicateThreshold: 0.7,
  mdReport: false,
  weights: {
    set: 0.35,
    sequence: 0.35,
    ast: 0.2,
    variant: 0.1
  },
  aiVerification: {
    enabled: false,
    endpoint: undefined,
    token: undefined,
    model: "internal-default",
    timeoutMs: 20000,
    maxPairs: 30,
    minCandidateScore: 0.7,
    blendWeight: 0.35
  },
  rules: {
    missingAwait: { enabled: true, severity: "warn" },
    randomWithoutSeed: { enabled: true, severity: "warn" },
    hardcodedSleep: { enabled: true, severity: "warn" },
    unhandledErrors: { enabled: true, severity: "warn" },
    modeMismatch: { enabled: true, severity: "error" },
    unreachableCalls: { enabled: true, severity: "info" },
    unusedArgs: { enabled: true, severity: "info" }
  }
};
