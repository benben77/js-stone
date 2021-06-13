import { IdToken } from "../Lexer";
import { ASTLeaf } from "./ASTLeaf";
import { ASTList } from "./ASTList";
import { ASTree } from "./ASTree";

export class BinaryExpr extends ASTList {
	constructor(t: ASTree[]) {
		super(t);
	}

	public left() {
		return this.child(0);
	}

	public operator() {
    return (this.child(1) as ASTLeaf<IdToken>).token().getText();
	}
	
	public right() {
		return this.child(2);
	}
}
