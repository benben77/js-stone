import { ASTList } from "./ASTList";
import { ASTree } from "./ASTree";

export class ArrayLiteral extends ASTList {
	constructor(c: ASTree[]) {
		super(c);
	}

	public size() {
		return this.numChildren();
	}
}
