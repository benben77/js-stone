import { TypeEnv } from "./TypeEnv";
import { UnknownTypeEx } from "./InferTypes";
import TypeInfo from "./TypeInfo";
import { DefStmnt } from "../Stone/ast/DefStmnt";
import { DefStmntEx2 } from "./TypeChecker";

interface DefStmntEx3 extends DefStmntEx2 {
  fixUnknown(t: TypeInfo): void;
}

const originTypeCheck = (DefStmnt.prototype as DefStmntEx2).typeCheck;

Object.assign(DefStmnt.prototype, {
  typeCheck(tenv: TypeEnv): TypeInfo {
    const func = originTypeCheck.call(this, tenv)!.toFunctionType()!;
    for (let t of func.parameterTypes)
      this.fixUnknown(t);
    this.fixUnknown(func.returnType);
    return func;
  },
  fixUnknown(t: TypeInfo) {
    if (t.isUnknownType()) {
      const ut = t.toUnknownType()!;
      if (!(ut as UnknownTypeEx).resolved())
        (ut as UnknownTypeEx).setType(TypeInfo.ANY);
    }
  }
} as DefStmntEx3);
