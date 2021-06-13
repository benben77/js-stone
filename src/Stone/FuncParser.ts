import { Arguments } from "./ast/Arguments";
import { DefStmnt } from "./ast/DefStmnt";
import { ParameterList } from "./ast/ParameterList";
import { BasicParser } from "./BasicParser";
import { Parser } from "./Parser";

const { rule } = Parser;

export class FuncParser extends BasicParser {
  protected param = rule().identifier(this.reserved);
  protected params = rule(ParameterList)
    .ast(this.param).repeat(rule().sep(",").ast(this.param));
  protected paramList = rule().sep("(").maybe(this.params).sep(")");
  protected def = rule(DefStmnt)
    .sep("def").identifier(this.reserved).ast(this.paramList).ast(this.block);
  protected args = rule(Arguments)
    .ast(this.expr).repeat(rule().sep(",").ast(this.expr));
  protected postfix = rule().sep("(").maybe(this.args).sep(")");

  constructor() {
    super();
    this.reserved.add(")");
    this.primary.repeat(this.postfix);
    this.simple.option(this.args);
    this.program.insertChoice(this.def);
  }
}