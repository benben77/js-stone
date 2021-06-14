import { Environment } from "../chap6/Environment";
import { ASTLeaf } from "../Stone/ast/ASTLeaf";
import { ASTList } from "../Stone/ast/ASTList";
import { ASTree } from "../Stone/ast/ASTree";
import { BinaryExpr } from "../Stone/ast/BinaryExpr";
import { BlockStmnt } from "../Stone/ast/BlockStmnt";
import { DefStmnt } from "../Stone/ast/DefStmnt";
import { Fun } from "../Stone/ast/Fun";
import { Name } from "../Stone/ast/Name";
import { ParameterList } from "../Stone/ast/ParameterList";
import { StoneException } from "../Stone/StoneException";
import { OptFunction } from "./OptFunction";
import { Symbols } from "./Symbols";
import "../chap10/ArrayEvaluator"; // side effect

export interface EnvEx2 extends Environment {
  symbols(): Symbols;
  put(nest: number, index: number, value: any): void;
  get(nest: number, index: number): any;
  putNew(name: string, value: any): void;
  where(name: string): Environment;
}

export interface ASTreeOptEx extends ASTree {
  lookup(syms: Symbols): void;
}

((ASTLeaf.prototype as any) as ASTreeOptEx).lookup = function (syms: Symbols) {
  // NTH
};

((ASTList.prototype as any) as ASTreeOptEx).lookup = function (syms: Symbols) {
  for (let t of this.children()) {
    (t as ASTreeOptEx).lookup(syms);
  }
};

Object.assign(DefStmnt.prototype, {
  lookup: function (syms: Symbols) {
    this.index = syms.putNew(this.name());
    this.size = (Fun as any).lookup(syms, this.parameters(), this.body());
  },
  eval: function (env: Environment) {
    (env as EnvEx2).put(
      0,
      this.index,
      new OptFunction(this.parameters(), this.body(), env, this.size),
    );
    return this.name();
  },
} as any);

(Fun as any).lookup = function (
  syms: Symbols,
  params: ParameterList,
  body: BlockStmnt,
) {
  const newSyms = new Symbols(syms);
  (params as ParameterList & ASTreeOptEx).lookup(newSyms);
  (body as BlockStmnt & ASTreeOptEx).lookup(newSyms);
  return newSyms.size();
};

Object.assign(Fun.prototype, {
  lookup: function (syms: Symbols) {
    this.size = (Fun as any).lookup(syms, this.parameters(), this.body());
  },
  eval(env: Environment) {
    return new OptFunction(this.parameters(), this.body(), env, this.size);
  },
} as any);

Object.assign(ParameterList.prototype, {
  lookup: function (syms: Symbols) {
    const s = this.size();
    this.offsets = new Array(s);
    for (let i = 0; i < s; i++)
      this.offsets[i] = syms.putNew(this.name(i)) as number;
  },
  eval: function (env: Environment, index: number, value: any) {
    (env as EnvEx2).put(0, this.offsets[index], value);
  },
} as any);

Object.assign(Name.prototype, {
  lookup: function (syms: Symbols) {
    const loc = syms.get(this.name());
    if (loc == null)
      throw new StoneException("undefined name: " + this.name(), this);
    this.nest = loc.nest;
    this.index = loc.index;
  },
  lookupForAssign: function (syms: Symbols) {
    const loc = syms.put(this.name());
    this.nest = loc.nest;
    this.index = loc.index;
  },
  eval: function (env: Environment) {
    if (this.index === undefined) return env.get(this.name());
    return (env as EnvEx2).get(this.nest, this.index);
  },
  evalForAssign: function (env: Environment, value: any) {
    if (this.index == undefined) env.put(this.name(), value);
    else (env as EnvEx2).put(this.nest, this.index, value);
  },
} as any);

const superComputeAssign = (BinaryExpr.prototype as any).computeAssign;
Object.assign(BinaryExpr.prototype, {
  lookup: function (syms: Symbols) {
    const left = this.left();
    if (this.operator() === "=") {
      if (left instanceof Name) {
        (left as any).lookupForAssign(syms);
        this.right().lookup(syms);
        return;
      }
    }
    left.lookup(syms);
    this.right().lookup(syms);
  },
  computeAssign(env: Environment, rvalue: any) {
    const l = this.left();
    if (l instanceof Name) {
      (l as any).evalForAssign(env, rvalue);
      return rvalue;
    }
    return superComputeAssign.call(this, env, rvalue);
  },
} as any);
