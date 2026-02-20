import type { DuplicateGroup, ScenarioSignature, SimilarityEvidence } from "../types/core.js";
import { UnionFind } from "./unionFind.js";

export function buildDuplicateGroups(
  signatures: ScenarioSignature[],
  pairs: SimilarityEvidence[],
  threshold: number
): DuplicateGroup[] {
  const uf = new UnionFind();
  for (const sig of signatures) {
    uf.make(sig.unitId);
  }
  for (const pair of pairs) {
    if (pair.final >= threshold) {
      uf.union(pair.leftUnit, pair.rightUnit);
    }
  }

  const byRoot = new Map<string, string[]>();
  for (const sig of signatures) {
    const root = uf.find(sig.unitId);
    const group = byRoot.get(root) ?? [];
    group.push(sig.unitId);
    byRoot.set(root, group);
  }

  const groups: DuplicateGroup[] = [];
  let id = 1;
  for (const members of byRoot.values()) {
    if (members.length < 2) continue;
    let total = 0;
    let count = 0;
    for (let i = 0; i < members.length; i += 1) {
      for (let j = i + 1; j < members.length; j += 1) {
        const pair = pairs.find(
          (p) =>
            (p.leftUnit === members[i] && p.rightUnit === members[j]) ||
            (p.leftUnit === members[j] && p.rightUnit === members[i])
        );
        if (pair) {
          total += pair.final;
          count += 1;
        }
      }
    }
    groups.push({
      groupId: `dup-${id}`,
      members: [...members].sort((a, b) => a.localeCompare(b)),
      avgScore: count === 0 ? 0 : total / count,
      centroidUnit: members[0]
    });
    id += 1;
  }
  return groups.sort((a, b) => b.avgScore - a.avgScore);
}
