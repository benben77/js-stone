import { Environment } from "../chap6/Environment";
import { BinaryExpr } from "../Stone/ast/BinaryExpr";
import { Dot } from "../Stone/ast/Dot";
import { StoneException } from "../Stone/StoneException";
import { OptStoneObject } from "./OptStoneObject";
import "./ObjOptimizer";

const dotSuperEval = (Dot.prototype as any).eval;
Object.assign(Dot.prototype, {
  eval(env: Environment, value: any) {
    if (value instanceof OptStoneObject) {
      const target = value as OptStoneObject;
      if (target.classInfo() != this.classInfo) this.updateCache(target);
      if (this.isField) return target.read(this.index);
      else return target.method(this.index);
    } else {
      return dotSuperEval.call(this, env, value);
    }
  },
  updateCache(target: OptStoneObject) {
    const member = this.name();
    this.classInfo = target.classInfo();
    let i = this.classInfo.fieldIndex(member);
    if (i != null) {
      this.isField = true;
      this.index = i;
      return;
    }
    i = this.classInfo.methodIndex(member);
    if (i != null) {
      this.isField = false;
      this.index = i;
      return;
    }
    throw new StoneException("bad member access: " + member, this);
  },
} as any);

Object.assign(BinaryExpr.prototype, {
  setField(obj: OptStoneObject, expr: Dot, rvalue: any) {
    if (obj.classInfo() != this.classInfo) {
      const member = expr.name();
      this.classInfo = obj.classInfo();
      let i = this.classInfo.fieldIndex(member);
      if (i == null)
        throw new StoneException("bad member access: " + member, this);
      this.index = i;
    }
    obj.write(this.index, rvalue);
    return rvalue;
  },
} as any);
