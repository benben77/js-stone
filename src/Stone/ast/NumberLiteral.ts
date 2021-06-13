import { NumToken } from "../Lexer";
import { ASTLeaf } from "./ASTLeaf";

export class NumberLiteral extends ASTLeaf<NumToken> {
  constructor(t: NumToken) {
		super(t);
	}

	public value(): number {
		return this.token().getNumber();
	}
}
