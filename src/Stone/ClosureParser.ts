import { Fun } from "./ast/Fun";
import { FuncParser } from "./FuncParser";
import { Parser } from "./Parser";

const { rule } = Parser;

export class ClosureParser extends FuncParser {
  constructor() {
    super();
    this.primary.insertChoice(rule(Fun).sep("fun").ast(this.paramList).ast(this.block));
  }
}
