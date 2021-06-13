// import "./BasicEvaluator"; // for side effect
// import { FunctionNode } from "../ast/Function";

import "../chap6/BasicEvaluator"; // side effect
import { ASTreeEx } from "../chap6/BasicEvaluator";
import { Environment } from "../chap6/Environment";
import { Arguments } from "../Stone/ast/Arguments";
import { DefStmnt } from "../Stone/ast/DefStmnt";
import { ParameterList } from "../Stone/ast/ParameterList";
import { Postfix } from "../Stone/ast/Postfix";
import { PrimaryExpr } from "../Stone/ast/PrimaryExpr";
import { StoneException } from "../Stone/StoneException";
import { FunctionNode } from "./FunctionNode";
import { EnvEx } from "./NestedEnv";

(DefStmnt.prototype as DefStmnt & ASTreeEx).eval = function (env: Environment) {
  (env as EnvEx).putNew(
    this.name(),
    new FunctionNode(this.parameters(), this.body(), env),
  );
  return this.name();
};

Object.assign(PrimaryExpr.prototype, {
  operand() {
    return ((this as any) as PrimaryExpr).child(0);
  },
  postfix(nest: number) {
    const me = (this as any) as PrimaryExpr;
    return me.child(me.numChildren() - nest - 1) as Postfix;
  },
  hasPostfix(nest: number) {
    return ((this as any) as PrimaryExpr).numChildren() - nest > 1;
  },
  eval(env: Environment) {
    return (this as any).evalSubExpr(env, 0);
  },
  evalSubExpr(env: Environment, nest: number) {
    const me = this as any;
    if (me.hasPostfix(nest)) {
      const target = me.evalSubExpr(env, nest + 1);
      return (me.postfix(nest) as any).eval(env, target);
    } else {
      return ((this.operand() as any) as ASTreeEx).eval(env);
    }
  },
});

(Arguments.prototype as Arguments & { eval: Function }).eval = function (
  callerEnv: Environment,
  value: any,
) {
  if (!(value instanceof FunctionNode))
    throw new StoneException("bad function", this);
  const func = value as FunctionNode;
  const params = func.parameters();
  if (this.size() !== params.size())
    throw new StoneException("bad number of arguments", this);
  const newEnv = func.makeEnv();
  let num = 0;
  for (let a of this.children()) {
    (params as any).eval(
      newEnv,
      num++,
      ((a as any) as ASTreeEx).eval(callerEnv),
    );
  }
  return (func.body() as any).eval(newEnv);
};

(ParameterList.prototype as ParameterList & {
  eval: Function;
}).eval = function (env: Environment, index: number, value: any) {
  (env as EnvEx).putNew(this.name(index), value);
};
