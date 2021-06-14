import { ASTLeaf } from "./ASTLeaf";
import { ASTList } from "./ASTList";
import { ASTree } from "./ASTree";

export class TypeTag extends ASTList {
	public static UNDEF = "<Undef>";

	constructor(c: ASTree[]) {
		super(c);
	}

	public type() {
		if (this.numChildren() > 0)
			return (this.child(0) as ASTLeaf<any>).token().getText();
		else
			return TypeTag.UNDEF;
	}

	public toString() {
		return ":" + this.type();
	}
}