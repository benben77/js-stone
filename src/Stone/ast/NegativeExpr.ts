import { ASTList } from "./ASTList";
import { ASTree } from "./ASTree";

export class NegativeExpr extends ASTList {
	constructor(t: ASTree[]) {
		super(t);
	}

	public operand() {
		return this.child(0);
	}

	public toString() {
		return `${this.operand()}`;
	}
}
