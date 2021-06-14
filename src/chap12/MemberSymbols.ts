import { Location, Symbols } from "../chap11/Symbols";

export class MemberSymbols extends Symbols {
  public static METHOD = -1;
  public static FIELD = -2;
  protected type: number;

  constructor(outer: Symbols, type: number) {
    super(outer);
    this.type = type;
  }

  // @Override
  public get(key: string, nest: number = 0) {
    const index = this.table.get(key);
    if (index == null) {
      if (this.outer == null) return null;
      return this.outer.get(key, nest);
    }
    return new Location(this.type, index);
  }

  public put(key: string) {
    const loc = this.get(key, 0);
    if (loc == null) return new Location(this.type, this.add(key));
    return loc;
  }
}
