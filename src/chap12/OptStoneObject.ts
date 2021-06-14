import { AccessException } from "../chap9/StoneObject";
import { OptClassInfo } from "./OptClassInfo";

export class OptStoneObject {
  protected _classInfo: OptClassInfo;
  protected fields: any[];

  constructor(ci: OptClassInfo, size: number) {
    this._classInfo = ci;
    this.fields = new Array(size);
  }

  public classInfo() {
    return this._classInfo;
  }

  public read(index: number | string) {
    if (typeof index === "number") {
      return this.fields[index];
    } else {
      let i = this._classInfo.fieldIndex(index);
      if (i != null) return this.fields[i as number];
      i = this._classInfo.methodIndex(index);
      if (i != null) return this.method(i);
      throw new AccessException();
    }
  }

  public write(index: number | string, value: any) {
    if (typeof index === "number") {
      this.fields[index] = value;
    } else {
      const i = this._classInfo.fieldIndex(index);
      if (i == null) throw new AccessException();
      else this.fields[i] = value;
    }
  }

  public method(index: number) {
    return this._classInfo.method(this, index);
  }
}
