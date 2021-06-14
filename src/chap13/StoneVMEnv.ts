import { ResizableArrayEnv } from "../chap11/ResizableArrayEnv";
import { Code } from "./Code";
import { HeapMemory } from "./HeapMemory";
import { StoneVM } from "./StoneVM";

export class StoneVMEnv extends ResizableArrayEnv implements HeapMemory {
  protected _svm: StoneVM;
  protected _code: Code;

  constructor(codeSize: number, stackSize: number, stringsSize: number) {
    super();
    this._svm = new StoneVM(codeSize, stackSize, stringsSize, this);
    this._code = new Code(this._svm);
  }
  public stoneVM() { return this._svm; }
  public code() { return this._code; }
  public read(index: number) { return this.values[index]; }
  public write(index: number, v: any) { this.values[index] = v; }
}
