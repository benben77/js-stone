import { IdToken } from "../Lexer";
import { ASTLeaf } from "./ASTLeaf";

export class Name extends ASTLeaf<IdToken> {
	constructor(t: IdToken) {
		super(t);
	}

	public name(): string {
		return this.token().getText();
	}
}