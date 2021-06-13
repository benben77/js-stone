import { ASTList } from "./ASTList";
import { ASTree } from "./ASTree";

export class Postfix extends ASTList {
	constructor(list: ASTree[]) {
		super(list);
	}
}