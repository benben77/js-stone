import { ASTree } from "../Stone/ast/ASTree";

export class TypeException extends Error {
	constructor(msg: string, t: ASTree) {
		super(msg + " " + t.location());
	}
}