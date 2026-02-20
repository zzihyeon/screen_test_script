export type ModeClass = "seq" | "random" | "unknown";

export interface SourceLoc {
  line: number;
  column: number;
}

export interface TestListItem {
  file: string;
  args: string[];
}

export interface ArgsVariant {
  rawArgs: string[];
  kv: Record<string, string | boolean>;
  mode: ModeClass;
  seed?: string;
  hasSeed: boolean;
}

export interface ImportBinding {
  local: string;
  source: string;
  imported: string;
}

export interface ImportMap {
  bindings: Map<string, ImportBinding>;
}

export interface CallFact {
  token: string;
  source: string;
  callee: string;
  awaited: boolean;
  inLoop: boolean;
  inBranch: boolean;
  retryLike: boolean;
  depth: number;
  loc?: SourceLoc;
}

export interface ParseArtifact {
  ast: import("@babel/types").File | null;
  warnings: string[];
}

export interface ScenarioSignature {
  unitId: string;
  file: string;
  argsVariant: ArgsVariant;
  callSequence: string[];
  callSet: string[];
  cfHints: string[];
  astHash: string;
  parseWarnings: string[];
}

export interface SimilarityEvidence {
  leftUnit: string;
  rightUnit: string;
  jaccard: number;
  seqScore: number;
  astScore: number;
  variantScore: number;
  baseFinal: number;
  final: number;
  aiScore?: number;
  aiReason?: string;
  reasons: string[];
}

export interface DuplicateGroup {
  groupId: string;
  members: string[];
  avgScore: number;
  centroidUnit?: string;
}

export type Severity = "info" | "warn" | "error";

export interface SuspiciousFinding {
  file: string;
  unitId?: string;
  ruleId: string;
  severity: Severity;
  message: string;
  confidence: number;
  loc?: SourceLoc;
}

export interface AnalysisUnit {
  unitId: string;
  file: string;
  args: string[];
  argsVariant: ArgsVariant;
}

export interface AnalysisUnitContext {
  unit: AnalysisUnit;
  ast: import("@babel/types").File | null;
  importMap: ImportMap;
  callFacts: CallFact[];
  parseWarnings: string[];
}

export interface FinalReport {
  version: string;
  generatedAt: string;
  signatures: ScenarioSignature[];
  duplicates: DuplicateGroup[];
  pairScores: SimilarityEvidence[];
  suspicious: SuspiciousFinding[];
}

export interface SimilarityWeights {
  set: number;
  sequence: number;
  ast: number;
  variant: number;
}

export interface RuleConfig {
  enabled: boolean;
  severity: Severity;
}

export interface ToolConfig {
  duplicateThreshold: number;
  nearDuplicateThreshold: number;
  weights: SimilarityWeights;
  mdReport: boolean;
  rules: Record<string, RuleConfig>;
  aiVerification: {
    enabled: boolean;
    endpoint?: string;
    token?: string;
    model?: string;
    timeoutMs: number;
    maxPairs: number;
    minCandidateScore: number;
    blendWeight: number;
  };
}
