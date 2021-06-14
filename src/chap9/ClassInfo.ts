import { Environment } from "../chap6/Environment";
import { ClassStmnt } from "../Stone/ast/ClassStmnt";
import { StoneException } from "../Stone/StoneException";

export class ClassInfo {
	protected definition: ClassStmnt;
	protected _environment: Environment;
	protected _superClass: ClassInfo | null;

	constructor(cs: ClassStmnt, env: Environment) {
		this.definition = cs;
		this._environment = env;
    const superClassName = cs.superClass();
		const obj: any = superClassName ? env.get(superClassName) : null;
		if (obj == null) {
      this._superClass = null;
    } else if (obj instanceof ClassInfo) {
			this._superClass = obj;
    } else {
			throw new StoneException("unkonw super class: " + cs.superClass(), cs);
    }
	}
	
	public name() {
		return this.definition.name();
	}
	
	public superClass() {
		return this._superClass;
	}
	
	public body() {
		return this.definition.body();
	}
	
	public environment() {
		return this._environment;
	}
	
	public toString() {
		return "<class " + this.name() + ">";
	}
}