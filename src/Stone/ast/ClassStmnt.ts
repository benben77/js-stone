import { Token } from "../Token";
import { ASTLeaf } from "./ASTLeaf";
import { ASTList } from "./ASTList";
import { ASTree } from "./ASTree";
import { ClassBody } from "./ClassBody";

export class ClassStmnt extends ASTList {
	constructor(c: ASTree[]) {
		super(c);
	}

	public name() {
    return (this.child(0) as ASTLeaf<Token>).token().getText();
	}

	public superClass() {
		if (this.numChildren() < 3) return null;
		return (this.child(1) as ASTLeaf<Token>).token().getText();
	}

	public body() {
		return this.child(this.numChildren() - 1) as ClassBody;
	}

	public toStirng() {
		let parent = this.superClass();
		if (parent == null) parent = "*";
		return "(class " + this.name() + " " + parent + " " + this.body() + ")";
	}
}
