import { ArrayEnv } from "./ArrayEnv";
import { Symbols } from "./Symbols";

export class ResizableArrayEnv extends ArrayEnv {
  protected names: Symbols;

  constructor() {
    super(10);
    this.names = new Symbols();
  }

  public symbols() {
    return this.names;
  }

  public get(name: string): void;
  public get(nest: number, index: number): void;
  public get(...args: any[]) {
    if (args.length === 2) return super.get(args[0], args[1]);
    const [name] = args as [string];
    const i = this.names.find(name);
    if (i == null) {
      if (this.outer == null) return null;
      return this.outer.get(name);
    } else {
      return this.values[i];
    }
  }

  public putNew(name: string, value: any) {
    this.assign(this.names.putNew(name)!, value);
  }

  public where(name: string) {
    if (this.names.find(name) != null) return this;
    if (this.outer == null) return null;
    return (this.outer as any).where(name);
  }

  public put(name: string, value: any): void;
  public put(nest: number, index: number, value: any): void;
  public put(...args: any[]) {
    if (args.length === 2) {
      const [name, value] = args as [string, any];
      let e = this.where(name);
      if (e == null) e = this;
      e.putNew(name, value);
    } else {
      const [nest, index, value] = args as [number, number, any];
      if (nest == 0) {
        this.assign(index, value);
      } else {
        super.put(nest, index, value);
      }
    }
  }

  protected assign(index: number, value: any) {
    // 暂时不做/不需要做动态扩容，否则若超出则扩容成双倍长度
    this.values[index] = value;
  }
}
