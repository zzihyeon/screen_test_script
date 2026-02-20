import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { loadConfig } from "./config/loadConfig.js";
import { readTestlist } from "./io/readTestlist.js";
import { parseFileBestEffort } from "./parser/parseFile.js";
import { buildImportMap } from "./resolver/importResolver.js";
import { extractCallFacts } from "./extract/callExtractor.js";
import { parseArgsVariant } from "./signature/argsVariant.js";
import { buildScenarioSignature } from "./signature/buildSignature.js";
import { hash, stableStringify } from "./utils/hash.js";
import { similarityEvidence } from "./similarity/aggregateScore.js";
import { buildDuplicateGroups } from "./cluster/buildGroups.js";
import { runHeuristics } from "./heuristics/engine.js";
import { buildFinalReport } from "./report/buildReport.js";
import { renderMarkdownReport } from "./report/markdown.js";
import { applyAiVerification } from "./ai/verifySimilarity.js";
import type { AnalysisUnit, FinalReport, ToolConfig } from "./types/core.js";

export interface AnalyzeOptions {
  root: string;
  testlist: string;
  out: string;
  configPath?: string;
  md?: boolean;
  threshold?: number;
  aiVerify?: boolean;
  aiEndpoint?: string;
  aiToken?: string;
  aiModel?: string;
}

function toAnalysisUnit(file: string, args: string[]): AnalysisUnit {
  return {
    file,
    args,
    argsVariant: parseArgsVariant(args),
    unitId: hash(`${file}::${stableStringify(args)}`)
  };
}

async function buildConfig(options: AnalyzeOptions): Promise<ToolConfig> {
  const base = await loadConfig(options.configPath);
  return {
    ...base,
    duplicateThreshold: options.threshold ?? base.duplicateThreshold,
    mdReport: options.md ?? base.mdReport,
    aiVerification: {
      ...base.aiVerification,
      enabled: options.aiVerify ?? base.aiVerification.enabled,
      endpoint: options.aiEndpoint ?? base.aiVerification.endpoint,
      token: options.aiToken ?? process.env.INTERNAL_AI_TOKEN ?? base.aiVerification.token,
      model: options.aiModel ?? base.aiVerification.model
    }
  };
}

export async function analyze(options: AnalyzeOptions): Promise<FinalReport> {
  const config = await buildConfig(options);
  const list = await readTestlist(options.testlist, options.root);
  const units = list.map((item) => toAnalysisUnit(item.file, item.args));
  const signatures = [];
  const suspicious = [];
  for (const unit of units) {
    const parsed = await parseFileBestEffort(unit.file);
    const importMap = buildImportMap(parsed.ast);
    const callFacts = extractCallFacts(parsed.ast, importMap);
    const ctx = {
      unit,
      ast: parsed.ast,
      importMap,
      callFacts,
      parseWarnings: parsed.warnings
    };
    signatures.push(buildScenarioSignature(ctx));
    suspicious.push(...runHeuristics(ctx, config));
  }

  const pairScores = [];
  for (let i = 0; i < signatures.length; i += 1) {
    for (let j = i + 1; j < signatures.length; j += 1) {
      pairScores.push(similarityEvidence(signatures[i], signatures[j], config.weights));
    }
  }
  await applyAiVerification(signatures, pairScores, config);

  const duplicates = buildDuplicateGroups(signatures, pairScores, config.duplicateThreshold);
  const report = buildFinalReport({
    signatures,
    duplicates,
    pairScores,
    suspicious
  });

  await mkdir(options.out, { recursive: true });
  await writeFile(path.join(options.out, "report.json"), `${JSON.stringify(report, null, 2)}\n`, "utf8");
  if (config.mdReport) {
    await writeFile(path.join(options.out, "report.md"), renderMarkdownReport(report), "utf8");
  }
  return report;
}
