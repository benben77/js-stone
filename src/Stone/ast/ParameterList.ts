import { Token } from "../Token";
import { ASTLeaf } from "./ASTLeaf";
import { ASTList } from "./ASTList";
import { ASTree } from "./ASTree";

export class ParameterList extends ASTList {
	constructor(list: ASTree[]) {
		super(list);
	}

	public name(i: number) {
    return (this.child(i) as ASTLeaf<Token>).token().getText();
	}

	public size() {
		return this.numChildren();
	}
}