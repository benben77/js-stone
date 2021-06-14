import { StoneException } from "../Stone/StoneException";
import TypeInfo from "./TypeInfo";

export class TypeEnv {
  protected outer: TypeEnv | null;
  protected types: TypeInfo[];

  constructor(size = 8, out: TypeEnv | null = null) {
    this.outer = out;
    this.types = new Array(size);
  }

  get(nest: number, index: number): TypeInfo | null {
    if (nest == 0)
			if (index < this.types.length)
				return this.types[index];
			else
				return null;
		else if (this.outer == null)
			return null;
		else
			return this.outer.get(nest - 1, index);
  }

  put(nest: number, index: number, value: TypeInfo): TypeInfo | null {
    let oldValue: TypeInfo;
		if (nest == 0) {
			// this.access(index); // 动态扩容，不需要
			oldValue = this.types[index];
			this.types[index] = value;
			return oldValue; // may be null
		} else if (this.outer == null)
			throw new StoneException("no outer type environment");
		else
			return this.outer.put(nest - 1, index, value);
  }
}
