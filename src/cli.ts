#!/usr/bin/env node
import { Command } from "commander";
import path from "node:path";
import { analyze } from "./index.js";

const program = new Command();

program.name("scenario-detector").description("Detect duplicate JS test scenarios");

program
  .command("analyze")
  .requiredOption("--testlist <path>", "Path to testlist JSON")
  .requiredOption("--root <path>", "Project root for test files/imports")
  .requiredOption("--out <path>", "Output directory for report.json")
  .option("--config <path>", "Path to config JSON")
  .option("--md", "Generate report.md")
  .option("--threshold <number>", "Duplicate threshold (0..1)", Number.parseFloat)
  .option("--ai-verify", "Enable AI similarity verification")
  .option("--ai-endpoint <url>", "Internal AI API endpoint")
  .option("--ai-token <token>", "Bearer token for internal AI API")
  .option("--ai-model <name>", "Model name sent to internal AI API")
  .action(async (options) => {
    const result = await analyze({
      testlist: path.resolve(options.testlist),
      root: path.resolve(options.root),
      out: path.resolve(options.out),
      configPath: options.config ? path.resolve(options.config) : undefined,
      md: Boolean(options.md),
      threshold: options.threshold,
      aiVerify: Boolean(options.aiVerify),
      aiEndpoint: options.aiEndpoint,
      aiToken: options.aiToken,
      aiModel: options.aiModel
    });
    process.stdout.write(
      `Analyzed ${result.signatures.length} units, found ${result.duplicates.length} duplicate groups.\n`
    );
  });

program.parseAsync(process.argv).catch((error) => {
  process.stderr.write(`${(error as Error).message}\n`);
  process.exitCode = 1;
});
