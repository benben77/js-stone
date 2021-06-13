import { ASTree } from "./ASTree";
import { Postfix } from "./Postfix";

export class Arguments extends Postfix {
	constructor(c: ASTree[]) {
		super(c);
	}

	public size() {
		return this.numChildren();
	}
}