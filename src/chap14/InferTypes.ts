import { ASTree } from "../Stone/ast/ASTree";
import { TypeEnv } from "./TypeEnv";
import TypeInfo, { UnknownType } from "./TypeInfo";

export interface UnknownTypeEx extends UnknownType {
  _type: TypeInfo | null;
  resolved(): boolean;
  setType(t: TypeInfo): void;
  assertSubtypeOf(t: TypeInfo, tenv: TypeEnv, where: ASTree): void;
  assertSupertypeOf(t: TypeInfo, tenv: TypeEnv, where: ASTree): void;
}

interface TypeEnvEx extends TypeEnv {
  equations?: Array<Array<UnknownType>>;
  addEquation(t1: UnknownType, t2: TypeInfo): void;
  find(t: UnknownType): Array<UnknownType>;
}

const originAssertSubtypeOf = TypeInfo.prototype.assertSubtypeOf;
const originUnion = TypeInfo.prototype.union;
const originPlus = TypeInfo.prototype.plus;

Object.assign(TypeInfo.prototype, {
  assertSubtypeOf(type: TypeInfo, tenv: TypeEnv, where: ASTree) {
    if (type.isUnknownType())
      (type.toUnknownType() as UnknownType & UnknownTypeEx).assertSupertypeOf(this, tenv, where);
    else
      originAssertSubtypeOf.call(this, type, tenv, where);
  },
  union(right: TypeInfo, tenv: TypeEnv) {
    if (right.isUnknownType())
      return right.union(this, tenv);
    else
      return originUnion.call(this, right, tenv);
  },
  plus(right: TypeInfo, tenv: TypeEnv) {
    if (right.isUnknownType())
      return right.plus(this, tenv);
    else
      return originPlus.call(this, right, tenv);
  }
} as TypeInfo);

Object.assign(UnknownType.prototype, {
  resolved() {
    return this._type!= null;
  },
  type() {
    return this._type == null ? TypeInfo.ANY : this._type;
  },
  setType(t: TypeInfo) {
    this._type = t;
  },
  assertSubtypeOf(t: TypeInfo, tenv: TypeEnv, where: ASTree) {
    if (this.resolved())
      this._type!.assertSubtypeOf(t, tenv, where);
    else
      (tenv as TypeEnvEx).addEquation(this, t);
  },
  assertSupertypeOf(t: TypeInfo, tenv: TypeEnv, where: ASTree) {
    if (this.resolved())
      t.assertSubtypeOf(this._type!, tenv, where);
    else
      (tenv as TypeEnvEx).addEquation(this, t);
  },
  union(right: TypeInfo, tenv: TypeEnv) {
    if (this.resolved())
      return this._type!.union(right, tenv);
    else {
      (tenv as TypeEnvEx).addEquation(this, right);
      return right;
    }
  },
  plus(right: TypeInfo, tenv: TypeEnv) {
    if (this.resolved())
      return this._type!.plus(right, tenv);
    else {
      (tenv as TypeEnvEx).addEquation(this, TypeInfo.INT);
      return right.plus(TypeInfo.INT, tenv);
    }
  }
} as UnknownTypeEx);

Object.assign(TypeEnv.prototype, {
  find(t: UnknownType): Array<UnknownType> {
    if (!this.equations) this.equations = [];
    for (let e of this.equations)
      if (e.includes(t))
        return e;
    const e: Array<UnknownType> = [];
    e.push(t);
    this.equations.push(e);
    return e;
  },
  addEquation(t1: UnknownType, t2: TypeInfo) {
    // assert t1.unknown() == true
    if (!this.equations) this.equations = [];
    if (t2.isUnknownType())
      if ((t2.toUnknownType() as UnknownTypeEx).resolved())
        t2 = t2.type();
    const eq = this.find(t1);
    if (t2.isUnknownType())
      eq.push(t2.toUnknownType()!);
    else {
      for (let t of eq)
        (t as UnknownTypeEx).setType(t2);
      this.equations.splice(this.equations.indexOf(eq), 1);
    }
  }
} as TypeEnvEx);
