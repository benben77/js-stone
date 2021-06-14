import { ASTreeEx } from "../chap6/BasicEvaluator";
import { Environment } from "../chap6/Environment";
import { ArrayLiteral } from "../Stone/ast/ArrayLiteral";
import { ArrayRef } from "../Stone/ast/ArrayRef";
import { ASTree } from "../Stone/ast/ASTree";
import { BinaryExpr } from "../Stone/ast/BinaryExpr";
import { PrimaryExpr } from "../Stone/ast/PrimaryExpr";
import { StoneException } from "../Stone/StoneException";
import "../chap9/ClassEvaluator"; // for side effect

(ArrayLiteral.prototype as ArrayLiteral & ASTreeEx).eval = function (
  env: Environment,
) {
  const s = this.numChildren();
  const res: any[] = new Array(s);
  let i = 0;
  for (let t of this.children()) res[i++] = (t as ASTree & ASTreeEx).eval(env);
  return res;
};

(ArrayRef.prototype as ArrayRef & { eval: Function }).eval = function (
  env: Environment,
  value: any,
) {
  if (Array.isArray(value)) {
    const index = (this.index() as ASTree & ASTreeEx).eval(env);
    if (typeof index === "number") return (value as any[])[index];
  }
  throw new StoneException("bad array access", this);
};

const originComputeAssign = (BinaryExpr.prototype as any).computeAssign;
(BinaryExpr.prototype as BinaryExpr & {
  computeAssign: Function;
}).computeAssign = function (env: Environment, rvalue: any) {
  const le = this.left();
  if (le instanceof PrimaryExpr) {
    const p = le as PrimaryExpr & { hasPostfix: Function; postfix: Function };
    if (p.hasPostfix(0) && p.postfix(0) instanceof ArrayRef) {
      const a = (le as any).evalSubExpr(env, 1);
      if (Array.isArray(a)) {
        const aref = p.postfix(0) as ArrayRef;
        const index = (aref.index() as ArrayRef & ASTreeEx).eval(env);
        if (typeof index === "number") {
          (a as any[])[index] = rvalue;
          return rvalue;
        }
      }
      throw new StoneException("bad array access", this);
    }
  }
  return originComputeAssign.call(this, env, rvalue);
};
