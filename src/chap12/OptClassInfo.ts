import { Symbols } from "../chap11/Symbols";
import { Environment } from "../chap6/Environment";
import { ClassInfo } from "../chap9/ClassInfo";
import { ClassStmnt } from "../Stone/ast/ClassStmnt";
import { DefStmnt } from "../Stone/ast/DefStmnt";
import { OptMethod } from "./OptMethod";
import { OptStoneObject } from "./OptStoneObject";

export class OptClassInfo extends ClassInfo {
  protected methods: Symbols;
  protected fields: Symbols;
  protected methodDefs: DefStmnt[];

  constructor(
    cs: ClassStmnt,
    env: Environment,
    methods: Symbols,
    fields: Symbols,
  ) {
    super(cs, env);
    this.methods = methods;
    this.fields = fields;
    this.methodDefs = [];
  }

  public size() {
    return this.fields.size();
  }

  public superClass(): OptClassInfo {
    return this._superClass as OptClassInfo;
  }

  public copyTo(f: Symbols, m: Symbols, mlist: DefStmnt[]) {
    f.append(this.fields);
    m.append(this.methods);
    mlist.push(...this.methodDefs);
  }

  public fieldIndex(name: string) {
    return this.fields.find(name);
  }

  public methodIndex(name: string) {
    return this.methods.find(name);
  }

  public method(self: OptStoneObject, index: number) {
    const def = this.methodDefs[index];
    return new OptMethod(
      def.parameters(),
      def.body(),
      this.environment(),
      (def as any).locals(),
      self,
    );
  }

  public setMethods(methods: DefStmnt[]) {
    this.methodDefs = methods;
  }
}
