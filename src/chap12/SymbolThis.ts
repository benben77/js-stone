import { Symbols } from "../chap11/Symbols";
import { StoneException } from "../Stone/StoneException";

export class SymbolThis extends Symbols {
  public static NAME = "this";

  constructor(outer: Symbols) {
    super(outer);
    this.add(SymbolThis.NAME);
  }

  public putNew(key: string): number {
    throw new StoneException("fatal");
  }

  public put(key: string) {
    const loc = this.outer!.put(key);
    if (loc.nest >= 0) loc.nest++;
    return loc;
  }
}
