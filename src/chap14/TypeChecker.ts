import { ASTLeaf } from "../Stone/ast/ASTLeaf";
import { ASTList } from "../Stone/ast/ASTList";
import { NumberLiteral } from "../Stone/ast/NumberLiteral";
import { DefStmntEx, ParamListEx, VarStmntEx } from "./TypedEvaluator";
import { TypeEnv } from "./TypeEnv";
import TypeInfo, { FunctionType } from "./TypeInfo";
import "./TypedEvaluator"; // side effect
import { Name } from "../Stone/ast/Name";
import { StringLiteral } from "../Stone/ast/StringLiteral";
import { TypeException } from "./TypeException";
import { ASTree } from "../Stone/ast/ASTree";
import { BinaryExpr } from "../Stone/ast/BinaryExpr";
import { NegativeExpr } from "../Stone/ast/NegativeExpr";
import { BlockStmnt } from "../Stone/ast/BlockStmnt";
import { NullStmnt } from "../Stone/ast/NullStmnt";
import { IfStmnt } from "../Stone/ast/IfStmnt";
import { WhileStmnt } from "../Stone/ast/WhileStmnt";
import { DefStmnt } from "../Stone/ast/DefStmnt";
import { ParameterList } from "../Stone/ast/ParameterList";
import { PrimaryExpr } from "../Stone/ast/PrimaryExpr";
import { Arguments } from "../Stone/ast/Arguments";
import { VarStmnt } from "../Stone/ast/VarStmnt";

export interface ASTreeTypeEx {
  typeCheck(tenv: TypeEnv): TypeInfo | null;
}

export interface DefStmntEx2 extends DefStmntEx {
  index: number;
  size: number;
  funcType: FunctionType;
  bodyEnv: TypeEnv;
  typeCheck(tenv: TypeEnv): TypeInfo | null;
}

Object.assign(ASTLeaf.prototype, {
  typeCheck(tenv: TypeEnv) {
    return null;
  }
} as ASTLeaf<any> & ASTreeTypeEx);

Object.assign(ASTList.prototype, {
  typeCheck(tenv: TypeEnv) {
    return null;
  }
} as ASTList & ASTreeTypeEx);

Object.assign(NumberLiteral.prototype, {
  typeCheck(tenv: TypeEnv) {
    return TypeInfo.INT;
  }
} as NumberLiteral & ASTreeTypeEx);

Object.assign(StringLiteral.prototype, {
  typeCheck(tenv: TypeEnv) {
    return TypeInfo.STRING;
  }
} as StringLiteral & ASTreeTypeEx);

Object.assign(Name.prototype, {
  typeCheck(tenv: TypeEnv) {
    this.type = tenv.get(this.nest, this.index);
    if (this.type == null)
      throw new TypeException("undefined name: " + this.name(), this);
    else
      return this.type;
  },
  typeCheckForAssign(tenv: TypeEnv, valueType: TypeInfo) {
    this.type = tenv.get(this.nest, this.index);
    if (this.type == null) {
      this.type = valueType;
      tenv.put(0, this.index, valueType);
      return valueType;
    } else {
      valueType.assertSubtypeOf(this.type, tenv, this);
      return this.type;
    }
  },
} as Name & ASTreeTypeEx & { type: TypeInfo | null, nest: number, index: number, typeCheckForAssign(tenv: TypeEnv, valueType: TypeInfo): TypeInfo });

Object.assign(NegativeExpr.prototype, {
  typeCheck(tenv: TypeEnv) {
    const t = (this.operand() as ASTList & ASTreeTypeEx).typeCheck(tenv)!;
    t.assertSubtypeOf(TypeInfo.INT, tenv, this);
    return TypeInfo.INT;
  }
} as NegativeExpr & ASTreeTypeEx);

Object.assign(BinaryExpr.prototype, {
  typeCheck(tenv: TypeEnv) {
    const op = this.operator();
    if ("=" === op)
      return this.typeCheckForAssign(tenv);
    else {
      this.leftType = (this.left() as ASTree & ASTreeTypeEx).typeCheck(tenv)!;
      this.rightType = (this.right() as ASTree & ASTreeTypeEx).typeCheck(tenv)!;
      if ("+" === op)
        return this.leftType.plus(this.rightType, tenv);
      else if ("==" === op)
        return TypeInfo.INT;
      else {
        this.leftType.assertSubtypeOf(TypeInfo.INT, tenv, this);
        this.rightType.assertSubtypeOf(TypeInfo.INT, tenv, this);
        return TypeInfo.INT;
      }
    }
  },
  typeCheckForAssign(tenv: TypeEnv) {
    this.rightType = (this.right() as ASTree & ASTreeTypeEx).typeCheck(tenv)!;
    const le = this.left();
    if (le instanceof Name)
      return (le as any).typeCheckForAssign(tenv, this.rightType);
    else
      throw new TypeException("bad assignment", this);
  }
} as BinaryExpr & ASTreeTypeEx & { leftType: TypeInfo, rightType: TypeInfo, typeCheckForAssign(tenv: TypeEnv): TypeInfo })

Object.assign(BlockStmnt.prototype, {
  typeCheck(tenv: TypeEnv) {
    this.type = TypeInfo.INT;
    for (let t of this.children())
      if (!(t instanceof NullStmnt))
        this.type = (t as ASTree & ASTreeTypeEx).typeCheck(tenv)!;
    return this.type;
  }
} as BlockStmnt & ASTreeTypeEx & { type: TypeInfo });

Object.assign(IfStmnt.prototype, {
  typeCheck(tenv: TypeEnv) {
    const condType = (this.condition() as ASTree & ASTreeTypeEx).typeCheck(tenv)!;
    condType.assertSubtypeOf(TypeInfo.INT, tenv, this);
    const thenType = (this.thenBlock() as ASTree & ASTreeTypeEx).typeCheck(tenv)!;
    let elseType: TypeInfo;
    const elseBk = this.elseBlock();
    if (elseBk == null)
      elseType = TypeInfo.INT;
    else
      elseType = (elseBk as ASTree & ASTreeTypeEx).typeCheck(tenv)!;
    return thenType.union(elseType, tenv);
  }
} as IfStmnt & ASTreeTypeEx);

Object.assign(WhileStmnt.prototype, {
  typeCheck(tenv: TypeEnv) {
    const condType = (this.condition() as ASTree & ASTreeTypeEx).typeCheck(tenv)!;
    condType.assertSubtypeOf(TypeInfo.INT, tenv, this);
    const bodyType = (this.body() as ASTree & ASTreeTypeEx).typeCheck(tenv)!;
    return bodyType.union(TypeInfo.INT, tenv);
  }
} as WhileStmnt & ASTreeTypeEx);

Object.assign(DefStmnt.prototype, {
  typeCheck(tenv: TypeEnv) {
    const params = (this.parameters() as any).types() as TypeInfo[];
    const retType = TypeInfo.get(this.type());
    this.funcType = TypeInfo.function(retType, params);
    const oldType = tenv.put(0, this.index, this.funcType);
    if (oldType != null)
      throw new TypeException("function redefinition: " + this.name(), this);
    this.bodyEnv = new TypeEnv(this.size, tenv);
    for (let i = 0; i < params.length; i++)
      this.bodyEnv.put(0, i, params[i]);
    const bodyType = (this.body() as any as ASTreeTypeEx).typeCheck(this.bodyEnv)!;
    bodyType.assertSubtypeOf(retType, tenv, this);
    return this.funcType as TypeInfo;
  }
} as DefStmnt & DefStmntEx2);

Object.assign(ParameterList.prototype, {
  types() {
    const s = this.size();
    const result = new Array(s);
    for (let i = 0; i < s; i++)
      result[i] = TypeInfo.get(this.typeTag(i));
    return result;
  }
} as ParamListEx & { types(): TypeInfo[] });

Object.assign(PrimaryExpr.prototype, {
  typeCheck(tenv: TypeEnv, nest: number = 0) {
    const me = this as any;
    if (me.hasPostfix(nest)) {
      const target = me.typeCheck(tenv, nest + 1);
      return (me.postfix(nest)).typeCheck(tenv, target);
    } else
      return (me.operand() as ASTreeTypeEx).typeCheck(tenv);
  }
} as PrimaryExpr & ASTreeTypeEx);

// 	@Reviser
// 	public static abstract class PostfixEx extends Postfix {
// 		public PostfixEx(List<ASTree> c) {
// 			super(c);
// 		}

// 		public abstract TypeInfo typeCheck(TypeEnv tenv, TypeInfo target) throws TypeException;
// 	}

Object.assign(Arguments.prototype, {
  typeCheck(tenv: TypeEnv, target: TypeInfo) {
    if (!(target instanceof FunctionType))
      throw new TypeException("bad function", this);
    this.funcType = target as FunctionType;
    const params = this.funcType.parameterTypes;
    if (this.size() != params.length)
      throw new TypeException("bad number of arguments", this);
    this.argTypes = new Array(params.length);
    let num = 0;
    for (let a of this.children()) {
      const t = this.argTypes[num] = (a as ASTree & ASTreeTypeEx).typeCheck(tenv)!;
      t.assertSubtypeOf(params[num++], tenv, this);
    }
    return this.funcType.returnType;
  }
} as Arguments & ASTreeTypeEx & {
  argTypes: TypeInfo[],
  funcType: FunctionType,
});

Object.assign(VarStmnt.prototype, {
  typeCheck(tenv: TypeEnv) {
    if (tenv.get(0, this.index) != null)
      throw new TypeException("duplicate variable: " + this.name(), this);
    this.varType = TypeInfo.get(this.type());
    tenv.put(0, this.index, this.varType);
    this.valueType = (this.initializer() as ASTree & ASTreeTypeEx).typeCheck(tenv)!;
    this.valueType.assertSubtypeOf(this.varType, tenv, this);
    return this.varType;
  }
} as VarStmntEx & ASTreeTypeEx & {
  varType: TypeInfo;
  valueType: TypeInfo;
});
