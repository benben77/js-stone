export class Location {
  constructor(public nest: number, public index: number) {}
}

export class Symbols {
  protected outer?: Symbols;
  protected table: Map<String, number>;

  constructor(outer?: Symbols) {
    this.outer = outer;
    this.table = new Map();
  }

  public size() {
    return this.table.size;
  }

  public append(s: Symbols) {
    for (const [k, v] of s.table.entries()) {
      this.table.set(k, v);
    }
  }

  public find(key: string) {
    return this.table.get(key);
  }

  public get(key: string, nest: number = 0): Location | null {
    if (!this.table.has(key)) {
      if (!this.outer) return null;
      return this.outer.get(key, nest + 1);
    }
    const index = this.table.get(key);
    return new Location(nest, index!);
  }

  public putNew(key: string) {
    if (!this.table.has(key)) return this.add(key);
    return this.find(key);
  }

  public put(key: string) {
    const loc = this.get(key, 0);
    if (loc == null) return new Location(0, this.add(key));
    return loc;
  }

  protected add(key: string) {
    const i = this.table.size;
    this.table.set(key, i);
    return i;
  }
}