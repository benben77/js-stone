import { ClassBody } from "./ast/ClassBody";
import { ClassStmnt } from "./ast/ClassStmnt";
import { Dot } from "./ast/Dot";
import { ClosureParser } from "./ClosureParser";
import { Parser } from './Parser';
import { Token } from "./Token";

const { rule } = Parser;

export class ClassParser extends ClosureParser {
  protected member = rule().or(this.def, this.simple);
  protected class_body = rule(ClassBody).sep("{").option(this.member)
    .repeat(rule().sep(";", Token.EOL).option(this.member))
    .sep("}");
  protected defclass = rule(ClassStmnt).sep("class").identifier(this.reserved)
    .option(rule().sep("extends").identifier(this.reserved))
    .ast(this.class_body);

  constructor() {
    super();
    this.postfix.insertChoice(rule(Dot).sep(".").identifier(this.reserved));
    this.program.insertChoice(this.defclass);
  }
}