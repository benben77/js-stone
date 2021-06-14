import { ASTList } from "./ASTList";
import { ASTree } from "./ASTree";

export class ClassBody extends ASTList {
	constructor(c: ASTree[]) {
		super(c);
	}
}
