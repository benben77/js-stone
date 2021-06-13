import { Token } from "../Token";
import { ASTLeaf } from "./ASTLeaf";

export class StringLiteral extends ASTLeaf<Token> {

	constructor(token: Token) {
		super(token);
	}

	public value() {
		return this.token().getText();
	}
}
