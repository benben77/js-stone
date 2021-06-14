import { TypeTag } from "./ast/TypeTag";
import { VarStmnt } from "./ast/VarStmnt";
import { FuncParser } from "./FuncParser";
import { Parser } from './Parser';

const { rule } = Parser;

export class TypedParser extends FuncParser {
	protected typeTag = rule(TypeTag).sep(":").identifier(this.reserved);
	protected variable = rule(VarStmnt).sep("var").identifier(this.reserved).maybe(this.typeTag).sep("=").ast(this.expr);

	constructor() {
		super();
		this.reserved.add(":");
		this.param.maybe(this.typeTag);
		this.def.reset().sep("def").identifier(this.reserved).ast(this.paramList).maybe(this.typeTag).ast(this.block);
		this.statement.insertChoice(this.variable);
	}
}
