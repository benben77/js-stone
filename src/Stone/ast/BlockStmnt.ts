import { ASTList } from "./ASTList";
import { ASTree } from "./ASTree";

export class BlockStmnt extends ASTList {
	constructor(t: ASTree[]) {
		super(t);
	}
}
