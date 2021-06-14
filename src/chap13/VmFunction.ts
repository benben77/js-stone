import { Environment } from "../chap6/Environment";
import { FunctionNode } from "../chap7/FunctionNode";
import { BlockStmnt } from "../Stone/ast/BlockStmnt";
import { ParameterList } from "../Stone/ast/ParameterList";

export class VmFunction extends FunctionNode {
	public _entry: number;

	constructor(parameters: ParameterList, body: BlockStmnt, env: Environment, entry: number) {
		super(parameters, body, env);
		this._entry = entry;
	}

  public entry() {
		return this._entry;
	}
}