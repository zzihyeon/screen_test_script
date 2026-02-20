export class UnionFind {
  private parent = new Map<string, string>();
  private rank = new Map<string, number>();

  make(x: string): void {
    if (!this.parent.has(x)) {
      this.parent.set(x, x);
      this.rank.set(x, 0);
    }
  }

  find(x: string): string {
    const p = this.parent.get(x);
    if (!p) {
      this.make(x);
      return x;
    }
    if (p !== x) {
      const root = this.find(p);
      this.parent.set(x, root);
      return root;
    }
    return p;
  }

  union(a: string, b: string): void {
    const ra = this.find(a);
    const rb = this.find(b);
    if (ra === rb) return;
    const rankA = this.rank.get(ra) ?? 0;
    const rankB = this.rank.get(rb) ?? 0;
    if (rankA < rankB) {
      this.parent.set(ra, rb);
      return;
    }
    if (rankA > rankB) {
      this.parent.set(rb, ra);
      return;
    }
    this.parent.set(rb, ra);
    this.rank.set(ra, rankA + 1);
  }
}
