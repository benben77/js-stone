import { ASTreeOptEx } from "../chap11/EnvOptimizer";
import { Symbols } from "../chap11/Symbols";
import { Environment } from "../chap6/Environment";
import { ASTLeaf } from "../Stone/ast/ASTLeaf";
import { BlockStmnt } from "../Stone/ast/BlockStmnt";
import { DefStmnt } from "../Stone/ast/DefStmnt";
import { ParameterList } from "../Stone/ast/ParameterList";
import { TypeTag } from "../Stone/ast/TypeTag";
import { VarStmnt } from "../Stone/ast/VarStmnt";
import "../chap13/VmEvaluator";

export abstract class DefStmntEx extends DefStmnt {
  abstract type(): TypeTag;
}

export abstract class ParamListEx extends ParameterList {
  abstract typeTag(i: number): TypeTag;
}

export abstract class VarStmntEx extends VarStmnt {
  index: number = 0;
  abstract lookup(syms: Symbols): void;
  abstract eval(env: Environment): any;
}

Object.assign(DefStmnt.prototype, {
  type() {
    return this.child(2) as TypeTag;
  },
  body() {
    return this.child(3) as BlockStmnt;
  },
  toString() {
    return "(def " + this.name() + " " + this.parameters() + " " + this.type() + " " + this.body() + ")";
  },
} as DefStmntEx);

Object.assign(ParameterList.prototype, {
  name(i: number) {
    return (this.child(i).child(0) as ASTLeaf<any>).token().getText();
  },
  typeTag(i: number) {
    return this.child(i).child(1) as TypeTag;
  },
} as ParamListEx);

Object.assign(VarStmnt.prototype, {
  lookup(syms: Symbols) {
    this.index = syms.putNew(this.name())!;
    (this.initializer() as ASTreeOptEx).lookup(syms);
  },
  eval(env: Environment) {
    const value = (this.initializer() as any).eval(env);
    (env as any).put(0, this.index, value);
    return value;
  }
} as VarStmntEx);
