import type { FinalReport } from "../types/core.js";

export function renderMarkdownReport(report: FinalReport): string {
  const lines: string[] = [];
  lines.push("# Duplicate Scenario Report");
  lines.push("");
  lines.push(`Generated: ${report.generatedAt}`);
  lines.push("");
  lines.push("## Duplicate Groups");
  lines.push("");
  if (report.duplicates.length === 0) {
    lines.push("- No duplicate groups found.");
  } else {
    for (const group of report.duplicates) {
      lines.push(`- ${group.groupId} (avgScore=${group.avgScore.toFixed(3)}): ${group.members.join(", ")}`);
    }
  }
  const aiUsed = report.pairScores.some((p) => typeof p.aiScore === "number");
  lines.push("");
  lines.push("## Similarity Engine");
  lines.push("");
  lines.push(`- Static similarity pairs: ${report.pairScores.length}`);
  lines.push(`- AI verification: ${aiUsed ? "enabled (partial/all candidates)" : "disabled"}`);
  if (aiUsed) {
    const aiPairs = report.pairScores.filter((p) => typeof p.aiScore === "number");
    lines.push(`- AI-verified pairs: ${aiPairs.length}`);
  }
  lines.push("");
  lines.push("## Suspicious Findings");
  lines.push("");
  if (report.suspicious.length === 0) {
    lines.push("- No suspicious findings.");
  } else {
    for (const finding of report.suspicious) {
      lines.push(
        `- [${finding.severity}] ${finding.ruleId} in ${finding.file}: ${finding.message} (confidence=${finding.confidence.toFixed(2)})`
      );
    }
  }
  return `${lines.join("\n")}\n`;
}
