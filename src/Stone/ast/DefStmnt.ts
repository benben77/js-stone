import { Token } from "../Token";
import { ASTLeaf } from "./ASTLeaf";
import { ASTList } from "./ASTList";
import { ASTree } from "./ASTree";
import { BlockStmnt } from "./BlockStmnt";
import { ParameterList } from "./ParameterList";

export class DefStmnt extends ASTList {
	constructor(list: ASTree[]) {
		super(list);
	}

	public name() {
    return (this.child(0) as ASTLeaf<Token>).token().getText();
	}

	public parameters() {
		return this.child(1) as ParameterList;
	}

	public body() {
    return this.child(2) as BlockStmnt;
	}

	public toString() {
		return "(def )" + this.name() + " " + this.parameters() + " " + this.body() + ")";
	}
}