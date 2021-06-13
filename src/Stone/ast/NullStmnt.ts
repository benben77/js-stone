import { ASTList } from "./ASTList";
import { ASTree } from "./ASTree";

export class NullStmnt extends ASTList {
	constructor(t: ASTree[]) {
		super(t);
  }
}
