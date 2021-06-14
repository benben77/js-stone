import { ArrayEnv } from "../chap11/ArrayEnv";
import "../chap11/EnvOptimizer"; // side effect
import { EnvEx2 } from "../chap11/EnvOptimizer";
import { Symbols } from "../chap11/Symbols";
import { Environment } from "../chap6/Environment";
import { BinaryExpr } from "../Stone/ast/BinaryExpr";
import { ClassBody } from "../Stone/ast/ClassBody";
import { ClassStmnt } from "../Stone/ast/ClassStmnt";
import { DefStmnt } from "../Stone/ast/DefStmnt";
import { Dot } from "../Stone/ast/Dot";
import { Name } from "../Stone/ast/Name";
import { PrimaryExpr } from "../Stone/ast/PrimaryExpr";
import { StoneException } from "../Stone/StoneException";
import { MemberSymbols } from "./MemberSymbols";
import { OptClassInfo } from "./OptClassInfo";
import { OptStoneObject } from "./OptStoneObject";
import { SymbolThis } from "./SymbolThis";

Object.assign(ClassStmnt.prototype, {
  lookup(syms: Symbols) {},
  eval(env: Environment) {
    const methodNames = new MemberSymbols(
      (env as EnvEx2).symbols(),
      MemberSymbols.METHOD,
    );
    const fieldNames = new MemberSymbols(methodNames, MemberSymbols.FIELD);
    const ci = new OptClassInfo(this, env, methodNames, fieldNames);
    (env as EnvEx2).putNew(this.name(), ci);
    const methods: DefStmnt[] = [];
    if (ci.superClass() != null)
      ci.superClass().copyTo(fieldNames, methodNames, methods);
    const newSyms = new SymbolThis(fieldNames);
    (this.body() as any).lookup(newSyms, methodNames, fieldNames, methods);
    ci.setMethods(methods);
    return this.name();
  },
} as ClassStmnt & { lookup(syms: Symbols): void, eval(env: Environment): string });

Object.assign(ClassBody.prototype, {
  eval(env: Environment) {
    for (let t of this.children()) {
      if (!(t instanceof DefStmnt)) (t as any).eval(env);
    }
    return null;
  },
  lookup(
    syms: Symbols,
    methodNames: Symbols,
    fieldNames: Symbols,
    methods: DefStmnt[],
  ) {
    for (let t of this.children()) {
      if (t instanceof DefStmnt) {
        const def = t as DefStmnt;
        const oldSize = methodNames.size();
        const i = methodNames.putNew(def.name()) as number;
        if (i >= oldSize) {
          methods.push(def);
        } else {
          methods[i] = def;
        }
        (def as any).lookupAsMethod(fieldNames);
      } else {
        (t as any).lookup(syms);
      }
    }
  },
} as ClassBody & {
  eval(env: Environment): any,
  lookup(
    syms: Symbols,
    methodNames: Symbols,
    fieldNames: Symbols,
    methods: DefStmnt[],
  ): void
});

Object.assign(DefStmnt.prototype, {
  locals() {
    return this.size;
  },
  lookupAsMethod(syms: Symbols) {
    const newSyms = new Symbols(syms);
    newSyms.putNew(SymbolThis.NAME);
    (this.parameters() as any).lookup(newSyms);
    (this.body() as any).lookup(newSyms);
    this.size = newSyms.size();
  },
} as any);

Object.assign(Dot.prototype, {
  eval(env: Environment, value: any) {
    const member = this.name();
    if (value instanceof OptClassInfo) {
      if (member === "new") {
        const ci = value;
        const newEnv = new ArrayEnv(1, ci.environment());
        const so = new OptStoneObject(ci, ci.size());
        newEnv.put(0, 0, so);
        this.initObject(ci, so, newEnv);
        return so;
      }
    } else if (value instanceof OptStoneObject) {
      try {
        return value.read(member);
      } catch (err) {}
    }
    throw new StoneException("bad member access: " + member, this);
  },
  initObject(ci: OptClassInfo, obj: OptStoneObject, env: Environment) {
    if (ci.superClass() != null) this.initObject(ci.superClass(), obj, env);
    (ci.body() as any).eval(env);
  },
} as any);

Object.assign(Name.prototype, {
  eval(env: Environment) {
    if (this.index === undefined) return env.get(this.name());
    else if (this.nest == MemberSymbols.FIELD)
      return this.getThis(env).read(this.index);
    else if (this.nest == MemberSymbols.METHOD)
      return this.getThis(env).method(this.index);
    else return (env as any).get(this.nest, this.index);
  },
  evalForAssign(env: Environment, value: any) {
    if (this.index === undefined) env.put(this.name(), value);
    else if (this.nest === MemberSymbols.FIELD)
      this.getThis(env).write(this.index, value);
    else if (this.nest === MemberSymbols.METHOD)
      throw new StoneException("cannot update a method: " + this.name(), this);
    else (env as any).put(this.nest, this.index, value);
  },
  getThis(env: Environment) {
    return (env as any).get(0, 0) as OptStoneObject;
  },
} as any);

const originComputeAssign = (BinaryExpr.prototype as any).computeAssign;
Object.assign(BinaryExpr.prototype, {
  computeAssign(env: Environment, rvalue: any) {
    const le = this.left();
    if (le instanceof PrimaryExpr) {
      const p = le as any;
      if (p.hasPostfix(0) && p.postfix(0) instanceof Dot) {
        const t = p.evalSubExpr(env, 1);
        if (t instanceof OptStoneObject)
          return this.setField(t, p.postfix(0) as Dot, rvalue);
      }
    }
    return originComputeAssign.call(this, env, rvalue);
  },
  setField(obj: OptStoneObject, expr: Dot, rvalue: any) {
    const name = expr.name();
    try {
      obj.write(name, rvalue);
      return rvalue;
    } catch (e) {
      throw new StoneException("bad member access: " + name, this);
    }
  },
} as any);
