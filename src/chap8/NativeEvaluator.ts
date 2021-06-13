import { ASTreeEx } from "../chap6/BasicEvaluator";
import { Arguments } from "../Stone/ast/Arguments";
import { ASTree } from "../Stone/ast/ASTree";
import { NativeFunction } from "./NativeFunction";
import "../chap7/ClosureEvaluator";
import { Environment } from "../chap6/Environment";

const originEval = (Arguments.prototype as any).eval;

(Arguments.prototype as Arguments & { eval: Function }).eval = function(callerEnv: Environment, value: any) {
  if (!(value instanceof NativeFunction)) return originEval.call(this, callerEnv, value);
  const func = value as NativeFunction;
  // const nparams = func.numOfParameters();
  // if (this.size() != nparams) throw new StoneException("bad number of arguments", this);
  const args: any[] = [];
  let num = 0;
  for (let a of this.children()) {
    const ae = a as ASTree & ASTreeEx;
    args[num++] = ae.eval(callerEnv);
  }
  return func.invoke(args, this);
};
