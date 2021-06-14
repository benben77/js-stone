import { ASTree } from "./ASTree";
import { Postfix } from "./Postfix";

export class ArrayRef extends Postfix {

	constructor(c: ASTree[]) {
		super(c);
	}

	public index() {
		return this.child(0);
	}

	public toString() {
		return "[" + this.index() + "]";
	}
}