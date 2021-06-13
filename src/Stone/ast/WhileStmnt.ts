import { ASTList } from "./ASTList";
import { ASTree } from "./ASTree";

export class WhileStmnt extends ASTList {
	constructor(t: ASTree[]) {
		super(t);
	}

	public condition() {
		return this.child(0);
	}

	public body() {
		return this.child(1);
	}

	public toString() {
		return "(while " + this.condition() + " " + this.body() + ")";
	}
}
