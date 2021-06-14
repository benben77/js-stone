
import { ArrayLiteral } from "./ast/ArrayLiteral";
import { ArrayRef } from "./ast/ArrayRef";
import { ClassParser } from "./ClassParser";
import { Parser } from './Parser';

const { rule } = Parser;

export class ArrayParser extends ClassParser {
	protected elements = rule(ArrayLiteral).ast(this.expr).repeat(rule().sep(",").ast(this.expr));

	constructor() {
		super();
		this.reserved.add("]");
		this.primary.insertChoice(rule().sep("[").maybe(this.elements).sep("]"));
		this.postfix.insertChoice(rule(ArrayRef).sep("[").ast(this.expr).sep("]"));
	}
}
