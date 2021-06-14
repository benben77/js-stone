import { ASTree } from '../Stone/ast/ASTree';
import { ClassBody } from '../Stone/ast/ClassBody';
import { ClassStmnt } from '../Stone/ast/ClassStmnt';
import { Dot } from '../Stone/ast/Dot';
import { BinaryExpr } from '../Stone/ast/BinaryExpr';
import { PrimaryExpr } from '../Stone/ast/PrimaryExpr';
import { ASTreeEx } from '../chap6/BasicEvaluator';
import { Environment } from '../chap6/Environment';
import { EnvEx, NestedEnv } from '../chap7/NestedEnv';
import { StoneException } from '../Stone/StoneException';
import { StoneObject } from './StoneObject';
import { ClassInfo } from './ClassInfo';
import '../chap8/NativeEvaluator'; // for side effect

(ClassStmnt.prototype as ClassStmnt & ASTreeEx).eval = function(env: Environment) {
  const ci = new ClassInfo(this, env);
  (env as EnvEx).put(this.name(), ci);
  return this.name();
};

(ClassBody.prototype as ClassBody & ASTreeEx).eval = function(env: Environment) {
  for (let t of this.children()) (t as ASTree & ASTreeEx).eval(env);
	return null;
};

Object.assign(Dot.prototype, {
  eval(env: Environment, value: any) {
    const member = this.name();
    if (value instanceof ClassInfo) {
      if ("new" === member) {
        const ci = value as ClassInfo;
        const e = new NestedEnv(ci.environment());
        const so = new StoneObject(e);
        e.putNew("this", so);
        this.initObject(ci, e);
        return so;
      }
    } else if (value instanceof StoneObject) {
      try {
        return value.read(member);
      } catch (e) {}
    }
    throw new StoneException("bad member access: " + member, this);
  },
  initObject(ci: ClassInfo, env: Environment) {
    const superClass = ci.superClass()
    if (superClass != null) this.initObject(superClass, env);
    (ci.body() as ClassBody & ASTreeEx).eval(env);
  }
} as Dot & {
  eval(env: Environment, value: any): any;
  initObject(ci: ClassInfo, env: Environment): void;
});

const originComputeAssign = (BinaryExpr.prototype as any).computeAssign;
Object.assign(BinaryExpr.prototype, {
  computeAssign(env: Environment, rvalue: any) {
    const le = this.left();
    if (le instanceof PrimaryExpr) {
      const p = le as any;
      if (p.hasPostfix(0) && p.postfix(0) instanceof Dot) {
        const t = (le as any).evalSubExpr(env, 1);
        if (t instanceof StoneObject)
          return this.setField(t, p.postfix(0), rvalue);
      }
    }
    return originComputeAssign.call(this, env, rvalue);
  },
  setField(obj: StoneObject, expr: Dot, rvalue: Object) {
    const name = expr.name();
    try {
      obj.write(name, rvalue);
      return rvalue;
    } catch (e) {
      throw new StoneException("bad member access " + this.location() + ": " + name);
    }
  },
} as BinaryExpr & {
  computeAssign(env: Environment, rvalue: any): any;
  setField(obj: StoneObject, expr: Dot, rvalue: Object): any;
});
