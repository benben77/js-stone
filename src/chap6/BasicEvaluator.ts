import { ASTLeaf } from "../Stone/ast/ASTLeaf";
import { ASTList } from "../Stone/ast/ASTList";
import { BinaryExpr } from "../Stone/ast/BinaryExpr";
import { BlockStmnt } from "../Stone/ast/BlockStmnt";
import { IfStmnt } from "../Stone/ast/IfStmnt";
import { Name } from "../Stone/ast/Name";
import { NegativeExpr } from "../Stone/ast/NegativeExpr";
import { NullStmnt } from "../Stone/ast/NullStmnt";
import { NumberLiteral } from "../Stone/ast/NumberLiteral";
import { StringLiteral } from "../Stone/ast/StringLiteral";
import { WhileStmnt } from "../Stone/ast/WhileStmnt";
import { StoneException } from "../Stone/StoneException";
import { Environment } from "./Environment";

const TRUE = 1;
const FALSE = 0;

export interface ASTreeEx {
  eval(env: Environment): any;
}

(ASTList.prototype as ASTList & ASTreeEx).eval = function(env: Environment) {
  throw new StoneException("cannot eval: " + this.toString(), this);
};
(ASTLeaf.prototype as ASTLeaf<any> & ASTreeEx).eval = function(env: Environment) {
  throw new StoneException("cannot eval: " + this.toString(), this);
};

(NumberLiteral.prototype as NumberLiteral & ASTreeEx).eval = function(env: Environment) {
  return this.value();
};

(StringLiteral.prototype as StringLiteral & ASTreeEx).eval = function(env: Environment) {
  return this.value();
};

(Name.prototype as Name & ASTreeEx).eval = function(env: Environment) {
  const name = this.name();
  if (!env.has(name)) throw new StoneException("undefined name:" + name, this);
  return env.get(name);
};

(NegativeExpr.prototype as NegativeExpr & ASTreeEx).eval = function(env: Environment) {
    const v = (this.operand() as any as ASTreeEx).eval(env);
    if (typeof v === 'number') return -v;
    throw new StoneException("bad type for-", this);
};

type BinaryEx = BinaryExpr & ASTreeEx & {
  computeAssign(env: Environment, rvalue: any): any;
  computeOp(left: any, op: string, right: any): any;
  computeNumber(left: number, op: string, right: number): any;
};

(BinaryExpr.prototype as BinaryEx).eval = function(env: Environment) {
  const op = this.operator();
  if (op === '=') {
    const right = (this.right() as any as ASTreeEx).eval(env);
    return this.computeAssign(env, right);
  } else {
    const left = (this.left() as any as ASTreeEx).eval(env);
    const right = (this.right() as any as ASTreeEx).eval(env);
    return this.computeOp(left, op, right);
  }
};
(BinaryExpr.prototype as BinaryEx).computeAssign = function(env: Environment, rvalue: any) {
  const l = this.left();
  if (l instanceof Name) {
    env.put(l.name(), rvalue);
    return rvalue
  } else {
    throw new StoneException("bad assignment", this);
  }
};
(BinaryExpr.prototype as BinaryEx).computeOp = function(left: any, op: string, right: any) {
  if (typeof left === 'number' && typeof right === 'number') {
    return this.computeNumber(left, op, right);
  } else if (op === '+') {
    return `${left}${right}`;
  } else if (op === '==') {
    return left === right ? TRUE : FALSE;
  } else {
    throw new StoneException("bad type", this);
  }
};
(BinaryExpr.prototype as BinaryEx).computeNumber = function(a: number, op: string, b: number) {
  switch(op) {
    case '+':
      return a + b;
    case '-':
        return a - b;
    case '*':
      return a * b;
    case '/':
      return a / b;
    case '%':
      return a % b;
    case '==':
      return a === b ? TRUE : FALSE;
    case '>':
      return a > b ? TRUE : FALSE;
    case '<':
      return a < b ? TRUE : FALSE;
    default:
      throw new StoneException("bad operator", this);
  }
};

(BlockStmnt.prototype as BlockStmnt & ASTreeEx).eval = function(env: Environment) {
  let result = 0;
  for (const t of this.children()) {
    if (!(t instanceof NullStmnt)) result = (t as any as ASTreeEx).eval(env);
  }
  return result
};

(IfStmnt.prototype as IfStmnt & ASTreeEx).eval = function(env: Environment) {
  const c = (this.condition() as any as ASTreeEx).eval(env);
  if (typeof c === 'number' && c !== FALSE) {
    return (this.thenBlock() as any as ASTreeEx).eval(env);
  } else {
    const b = this.elseBlock();
    if (!b) return 0;
    return (b as any as ASTreeEx).eval(env);
  }
};

(WhileStmnt.prototype as WhileStmnt & ASTreeEx).eval = function(env: Environment) {
  let result = 0;
  for (;;) {
    let c = (this.condition() as any as ASTreeEx).eval(env);
    if (typeof c === 'number' && c === FALSE) return result;
    result = (this.body() as any as ASTreeEx).eval(env);
  }
};
