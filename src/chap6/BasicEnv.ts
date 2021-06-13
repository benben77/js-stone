import { Environment } from "./Environment";

export class BasicEnv implements Environment {
  protected values: Map<string, any> = new Map();
  public put(name: string, value: any) {
    this.values.set(name, value);
  }
	public get(name: string) {
    return this.values.get(name);
  }
  public has(name: string) {
    return this.values.has(name);
  }
}
