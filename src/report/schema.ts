import { z } from "zod";

export const finalReportSchema = z.object({
  version: z.string(),
  generatedAt: z.string(),
  signatures: z.array(z.any()),
  duplicates: z.array(z.any()),
  pairScores: z.array(z.any()),
  suspicious: z.array(z.any())
});
