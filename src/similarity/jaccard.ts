export function jaccardScore(left: string[], right: string[]): number {
  const a = new Set(left);
  const b = new Set(right);
  if (a.size === 0 && b.size === 0) {
    return 1;
  }
  let intersect = 0;
  for (const token of a) {
    if (b.has(token)) {
      intersect += 1;
    }
  }
  const union = a.size + b.size - intersect;
  if (union === 0) {
    return 0;
  }
  return intersect / union;
}
