import { BinaryExpr } from "./ast/BinaryExpr";
import { BlockStmnt } from "./ast/BlockStmnt";
import { IfStmnt } from "./ast/IfStmnt";
import { Name } from "./ast/Name";
import { NegativeExpr } from "./ast/NegativeExpr";
import { NullStmnt } from "./ast/NullStmnt";
import { NumberLiteral } from "./ast/NumberLiteral";
import { PrimaryExpr } from "./ast/PrimaryExpr";
import { StringLiteral } from "./ast/StringLiteral";
import { WhileStmnt } from "./ast/WhileStmnt";
import { Lexer } from "./Lexer";
import { Parser } from "./Parser";
import { Token } from "./Token";

const { Operators, rule } = Parser;

export class BasicParser {
  protected reserved: Set<String> = new Set();
  protected operators = new Operators();
  protected expr0 = rule();
  protected primary = rule(PrimaryExpr).or(rule().sep("(").ast(this.expr0).sep(")"), rule().number(NumberLiteral),
      rule().identifier(Name, this.reserved), rule().string(StringLiteral));
  protected factor = rule().or(rule(NegativeExpr).sep("-").ast(this.primary), this.primary);
  protected expr = this.expr0.expression(BinaryExpr, this.factor, this.operators);
  protected statement0 = rule();
  protected block = rule(BlockStmnt).sep("{").option(this.statement0)
      .repeat(rule().sep(";", Token.EOL).option(this.statement0)).sep("}");
  protected simple = rule(PrimaryExpr).ast(this.expr);
  protected statement = this.statement0.or(
    rule(IfStmnt).sep("if").ast(this.expr).ast(this.block).option(rule().sep("else").ast(this.block)),
    rule(WhileStmnt).sep("while").ast(this.expr).ast(this.block), this.simple);
  protected program = rule().or(this.statement, rule(NullStmnt)).sep(";", Token.EOL);
      
  constructor() {
    this.reserved.add(";");
		this.reserved.add("}");
		this.reserved.add(Token.EOL);

		this.operators.add("=", 1, Operators.RIGHT);
		this.operators.add("==", 2, Operators.LEFT);
		this.operators.add(">", 2, Operators.LEFT);
		this.operators.add("<", 2, Operators.LEFT);
		this.operators.add("+", 3, Operators.LEFT);
		this.operators.add("-", 3, Operators.LEFT);
		this.operators.add("*", 4, Operators.LEFT);
		this.operators.add("/", 4, Operators.LEFT);
		this.operators.add("%", 4, Operators.LEFT);
  }

  public parse(lexer: Lexer) {
		return this.program.parse(lexer);
	}
}
