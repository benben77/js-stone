import { ASTLeaf } from "./ASTLeaf";
import { ASTList } from "./ASTList";
import { ASTree } from "./ASTree";
import { TypeTag } from "./TypeTag";

export class VarStmnt extends ASTList {
	constructor(c: ASTree[]) {
		super(c);
	}

	public name() {
		return (this.child(0) as ASTLeaf<any>).token().getText();
	}

	public type(): TypeTag {
		return this.child(1) as TypeTag;
	}

	public initializer() {
		return this.child(2);
	}

	public toString() {
		return "(var " + this.name() + " " + this.type() + " " + this.initializer() + ")";
	}
}
