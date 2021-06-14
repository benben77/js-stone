import { Environment } from "../chap6/Environment";
import { StoneException } from "../Stone/StoneException";

export class ArrayEnv implements Environment {
  protected values: any[];
  protected outer?: Environment;
  
  constructor(size: number, out?: Environment) {
		this.values = new Array(size);
		this.outer = out;
  }
  
  public symbols() {
		throw new StoneException("no symbols");
  }
  
  public get(nest: number, index: number): void;
  public get(...args: any[]) {
    const [nest, index] = args;
		if (nest === 0) return this.values[index];
		if (!this.outer) return null;
		return this.outer.get(nest - 1, index);
	}

  public put(nest: number, index: number, value: any): void;
  public put(...args: any[]) {
    const [nest, index, value] = args as [number, number, any];
		if (nest === 0) {
      this.values[index] = value;
    } else if (!this.outer) {
			throw new StoneException("no outer environment");
		} else {
      this.outer.put(nest - 1, index, value);
    }
  }
  
  public setOuter(e: Environment) {
		this.outer = e;
  }
  
  public has() {
    return true; // TODO
  }
}
