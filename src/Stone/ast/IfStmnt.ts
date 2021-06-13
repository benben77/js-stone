import { ASTList } from "./ASTList";
import { ASTree } from "./ASTree";

export class IfStmnt extends ASTList {
	constructor(t: ASTree[]) {
		super(t);
	}

	public condition() {
		return this.child(0);
	}

	public thenBlock() {
		return this.child(1);
	}

	public elseBlock() {
		return this.numChildren() > 2 ? this.child(2) : null;
	}

	public toString() {
		return "(if " + this.condition() + " " + this.thenBlock() + " else " + this.elseBlock() + ")";
	}
}