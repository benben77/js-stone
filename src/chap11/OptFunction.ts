import { Environment } from "../chap6/Environment";
import { FunctionNode } from "../chap7/FunctionNode";
import { BlockStmnt } from "../Stone/ast/BlockStmnt";
import { ParameterList } from "../Stone/ast/ParameterList";
import { ArrayEnv } from "./ArrayEnv";

export class OptFunction extends FunctionNode {
	protected size: number;

	constructor(parameters: ParameterList, body: BlockStmnt, env: Environment, memorySize: number) {
		super(parameters, body, env);
		this.size = memorySize;
	}

	public makeEnv(): Environment {
		return new ArrayEnv(this.size, this._env);
	}
}