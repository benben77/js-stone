import { Token } from "../Token";
import { ASTLeaf } from "./ASTLeaf";
import { ASTree } from "./ASTree";
import { Postfix } from "./Postfix";

export class Dot extends Postfix {
	constructor(c: ASTree[]) {
		super(c);
	}

	public name() {
		return (this.child(0) as ASTLeaf<Token>).token().getText();
	}

	public toString() {
		return "." + this.name();
	}
}
