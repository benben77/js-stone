import { ASTList } from "./ASTList";
import { ASTree } from "./ASTree";
import { BlockStmnt } from "./BlockStmnt";
import { ParameterList } from "./ParameterList";

export class Fun extends ASTList {
	constructor(c: ASTree[]) {
		super(c);
	}

	public parameters() {
		return this.child(0) as ParameterList;
	}

	public body() {
		return this.child(1) as BlockStmnt;
	}

	public toString() {
		return "(fun " + this.parameters() + " " + this.body() + ")";
	}
}
