import { ASTree } from "../Stone/ast/ASTree";
import { TypeTag } from "../Stone/ast/TypeTag";
import { TypeEnv } from "./TypeEnv";
import { TypeException } from "./TypeException";

class TypeInfo {
  static ANY: TypeInfo;
  static INT: TypeInfo;
  static STRING: TypeInfo;

  static function(ret: TypeInfo, params: TypeInfo[]) {
		return new FunctionType(ret, params);
	}
  
  type(): TypeInfo {
    return this;
  }

  match(obj: TypeInfo) {
		return this.type() === obj.type();
	}

  subtypeOf(st: TypeInfo) {
		const superType = st.type();
		return this.type() == superType || superType == TypeInfo.ANY;
	}

  assertSubtypeOf(type: TypeInfo, env: TypeEnv, where: ASTree){
		if (!this.subtypeOf(type)) throw new TypeException("type mismatch: cannot convert from " + this + " to " + type, where);
	}

  union(right: TypeInfo, tenv: TypeEnv): TypeInfo {
		if (this.match(right))
			return this.type();
		else
			return TypeInfo.ANY;
	}

  plus(right: TypeInfo, tenv: TypeEnv): TypeInfo {
    const { INT, STRING, ANY } = TypeInfo;
		if (INT.match(this) && INT.match(right))
			return INT;
		else if (STRING.match(this) || STRING.match(right))
			return STRING;
		else
			return ANY;
	}

  isFunctionType() {
		return false;
	}

	toFunctionType(): FunctionType | null {
		return null;
	}

	isUnknownType() {
		return false;
	}

	public toUnknownType(): UnknownType | null {
		return null;
	}

  static  get(tag: TypeTag): TypeInfo {
    const { INT, STRING, ANY } = TypeInfo;
		const tname = tag.type();
		if (INT.toString() === tname)
			return INT;
		else if (STRING.toString() === tname)
			return STRING;
		else if (ANY.toString() === tname)
			return ANY;
		else if (TypeTag.UNDEF === tname)
			return new UnknownType();
    else
		  throw new TypeException("unknown type " + tname, tag);
	}
}

export class UnknownType extends TypeInfo {
  type() {
    return TypeInfo.ANY;
  }

  toString() {
    return this.type().toString();
  }

	isUnknownType() {
    return true;
  }

  toUnknownType() {
    return this;
  }
}

export class FunctionType extends TypeInfo {
		public returnType: TypeInfo;
		public parameterTypes: TypeInfo[];

		constructor(ret: TypeInfo, params: TypeInfo[]) {
      super();
			this.returnType = ret;
			this.parameterTypes = params;
		}

		isFunctionType() {
			return true;
		}

		toFunctionType() {
			return this;
		}

		match(obj: TypeInfo) {
			if (!(obj instanceof FunctionType))
				return false;
			const func = obj as FunctionType;
      const { parameterTypes, returnType } = this;
			if (parameterTypes.length != func.parameterTypes.length)
				return false;
			for (let i = 0; i < parameterTypes.length; i++)
				if (!parameterTypes[i].match(func.parameterTypes[i]))
					return false;
			return returnType.match(func.returnType);
		}

		toString() {
			let sb = '';
      const { parameterTypes, returnType } = this;
			if (parameterTypes.length == 0)
				sb += "Unit";
			else
				for (let i = 0; i < parameterTypes.length; i++) {
					if (i > 0)
						sb += " * ";
					sb += parameterTypes[i];
				}
			sb += " -> " + returnType;
			return sb;
		}
}

TypeInfo.ANY = new TypeInfo();
TypeInfo.ANY.toString = () => 'Any';

TypeInfo.INT = new TypeInfo();
TypeInfo.INT.toString = () => 'Int';

TypeInfo.STRING = new TypeInfo();
TypeInfo.STRING.toString = () => 'String';

export default TypeInfo;
