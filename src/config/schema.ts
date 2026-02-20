import { z } from "zod";

const ruleConfigSchema = z.object({
  enabled: z.boolean(),
  severity: z.enum(["info", "warn", "error"])
});

export const toolConfigSchema = z.object({
  duplicateThreshold: z.number().min(0).max(1),
  nearDuplicateThreshold: z.number().min(0).max(1),
  mdReport: z.boolean(),
  weights: z.object({
    set: z.number(),
    sequence: z.number(),
    ast: z.number(),
    variant: z.number()
  }),
  aiVerification: z.object({
    enabled: z.boolean(),
    endpoint: z.string().optional(),
    token: z.string().optional(),
    model: z.string().optional(),
    timeoutMs: z.number().int().positive(),
    maxPairs: z.number().int().positive(),
    minCandidateScore: z.number().min(0).max(1),
    blendWeight: z.number().min(0).max(1)
  }),
  rules: z.record(z.string(), ruleConfigSchema)
});

export type ToolConfigInput = z.input<typeof toolConfigSchema>;
