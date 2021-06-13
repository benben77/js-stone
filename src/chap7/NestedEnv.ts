import { Environment } from "../chap6/Environment";

export interface EnvEx extends Environment {
  putNew(name: String, value: any): void;
  where(name: string): Environment | null;
  setOuter(e: Environment): void;
}

export class NestedEnv implements EnvEx {
  protected values: Map<string, any>;
  protected outer?: Environment;

  constructor(e?: Environment) {
    this.values = new Map();
    this.outer = e;
  }

  public setOuter(e: Environment) {
		this.outer = e;
  }
  
  public put(name: string, value: any) {
		const e = this.where(name) || this;
    (e as EnvEx).putNew(name, value);
  }

  public putNew(name: string, value: any) {
		this.values.set(name, value);
  }
  
  public get(name: string) {
    if (!this.values.has(name) && this.outer) return this.outer.get(name);
		return this.values.get(name);
  }

  public has(name: string): boolean {
    const e = this.where(name) || this;
    return (e as NestedEnv).values.has(name);
  }
  
  public where(name: string): Environment | null {
		if (this.values.has(name)) return this;
		if (!this.outer) return null;
		return (this.outer as EnvEx).where(name);
	}
}
