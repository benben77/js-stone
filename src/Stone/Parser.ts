import { ASTLeaf } from "./ast/ASTLeaf";
import { ASTList } from "./ast/ASTList";
import { ASTree } from "./ast/ASTree";
import { Lexer } from "./Lexer";
import { ParseException } from "./ParseException";
import { Token } from "./Token";

abstract class Element {
  public abstract parse(lexer: Lexer, res: ASTree[]): void;
  public abstract match(lexer: Lexer): boolean;
}

class Tree extends Element {
  public parser: Parser;
  constructor(public p: Parser) {
    super();
    this.parser = p;
  }
  public parse(lexer: Lexer, res: ASTree[]) {
    res.push(this.parser.parse(lexer));
  }
  public match(lexer: Lexer) { 
    return this.parser.match(lexer);
  }
}

class OrTree extends Element {
  public parsers: Parser[];
  constructor(public p: Parser[]) {
    super();
    this.parsers = p;
  }
  public parse(lexer: Lexer, res: ASTree[]) {
    const p = this.choose(lexer);
    if (p == null)  throw new ParseException(lexer.peek(0));
    res.push(p.parse(lexer));
  }
  public match(lexer: Lexer) {
    return this.choose(lexer) != null;
  }
  public choose(lexer: Lexer): Parser | null {
    for (let p of this.parsers) {
      if (p.match(lexer)) return p;
    }
    return null;
  }
  public insert(p: Parser) {
    this.parsers.unshift(p);
  }
}

class Repeat extends Element {
  public parser: Parser;
  public onlyOnce: boolean;
  constructor(p: Parser, once: boolean) {
    super();
    this.parser = p;
    this.onlyOnce = once;
  }
  public parse(lexer: Lexer, res: ASTree[]) {
    while (this.parser.match(lexer)) {
      const t = this.parser.parse(lexer);
      if (t.constructor !== ASTList || (t as ASTree).numChildren() > 0) res.push(t);
      if (this.onlyOnce) break;
    }
  }
  public match(lexer: Lexer) {
    return this.parser.match(lexer);
  }
}

abstract class AToken extends Element {
  public factory: Factory;
  constructor(type: typeof ASTLeaf = ASTLeaf) {
    super();
    this.factory = Factory.get(type, Token);
  }
  public parse(lexer: Lexer, res: ASTree[]) {
    const t = lexer.read();
    if (this.test(t)) {
      const leaf = this.factory.make(t);
      res.push(leaf);
    } else {
      throw new ParseException(t);
    }
  }
  public match(lexer: Lexer) {
      return this.test(lexer.peek(0));
  }
  public abstract test(t: Token): boolean;
}

class IdToken extends AToken {
  private reserved: Set<string>;
  constructor(type?: typeof ASTLeaf, r: Set<string> = new Set<string>()) {
    super(type);
    this.reserved = r;
  }
  public test(t: Token) {
    return t.isIdentifier() && !this.reserved.has(t.getText());
  }
}

class NumToken extends AToken {
  constructor(type: typeof ASTLeaf) {
    super(type);
  }
  public test(t: Token) {
    return t.isNumber();
  }
}

class StrToken  extends AToken {
  constructor(type: typeof ASTLeaf) {
    super(type);
  }
  public test(t: Token) {
    return t.isString();
  }
}

class Leaf extends Element {
  public tokens: string[];
  constructor(pat: string[]) {
    super();
    this.tokens = pat;
  }
  public parse(lexer: Lexer, res: ASTree[]) {
    const t = lexer.read();
    if (t.isIdentifier()) {
      for (let token of this.tokens) {
        if (token === t.getText()) {
          this.find(res, t);
          return;
        }
      }
    }
    if (this.tokens.length > 0) {
      throw new ParseException(this.tokens[0] + " expected.", t);
    } else {
      throw new ParseException(t);
    }
  }
  public find(res: ASTree[], t: Token) {
    res.push(new ASTLeaf(t));
  }
  public match(lexer: Lexer) {
    const t = lexer.peek(0);
    if (t.isIdentifier()) {
      for (let token of this.tokens) {
        if (token === t.getText()) return true;  
      }
    }
    return false;
  }
}

class Skip extends Leaf {
  constructor(t: string[]) { super(t); }
  public find(res: ASTree[], t: Token) {}
}

class Precedence {
  // value越大优先级越大，leftAssoc表示是否为左结合
  // 左结合：((1 + 2) + 3)  右结合：(a = (b = 3))
  constructor(public value: number, public leftAssoc: boolean) {}
}

class Operators {
  public static LEFT = true;
  public static RIGHT = false;
  private map: Map<string, Precedence> = new Map();
  public get(name: string) {
    return this.map.get(name);
  }
  public add(name: string, prec: number, leftAssoc: boolean) {
    this.map.set(name, new Precedence(prec, leftAssoc));
  }
}

class Expr extends Element {
  public factory: Factory;
  public ops: Operators;
  public factor: Parser;
  constructor(clazz: (new (...args: any[]) => ASTree) | null, exp: Parser, map: Operators) {
    super();
    this.factory = Factory.getForASTList(clazz);
    this.ops = map;
    this.factor = exp;
  }
  public parse(lexer: Lexer, res: ASTree[]) {
    let right = this.factor.parse(lexer);
    let prec: Precedence | null;
    while ((prec = this.nextOperator(lexer)) != null) {
      right = this.doShift(lexer, right, prec.value);
    }
    res.push(right);
  }
  private doShift(lexer: Lexer, left: ASTree, prec: number): ASTree {
    const list: ASTree[] = [];
    list.push(left);
    list.push(new ASTLeaf(lexer.read()));
    let right = this.factor.parse(lexer);
    let next: Precedence | null;
    while ((next = this.nextOperator(lexer)) != null && this.rightIsExpr(prec, next)) {
      right = this.doShift(lexer, right, next.value);
    }
    list.push(right);
    return this.factory.make(list);
  }
  private nextOperator(lexer: Lexer): Precedence | null {
    const t = lexer.peek(0);
    if (t.isIdentifier()) {
      return this.ops.get(t.getText()) || null;
    } else {
      return null;
    }
  }
  private rightIsExpr(prec: number, nextPrec: Precedence) {
    if (nextPrec.leftAssoc)
      return prec < nextPrec.value;
    else
      return prec <= nextPrec.value;
  }
  public match(lexer: Lexer) {
    return this.factor.match(lexer);
  }
}

class Factory {
  static getForASTList(clazz: (new (...args: any[]) => ASTree) | null): Factory {
    let f = Factory.get(clazz, Array);
    if (f == null) {
      f = new Factory((arg: any) => {
        const results = arg as ASTree[];
        // 如果只有一个子节点，则省略掉ASTList节点
        if (results.length == 1)
          return results[0];
        else
          return new ASTList(results);
      });
    };
    return f;
  }
  static get(clazz: (new (...args: any[]) => ASTree) | null, argType: new (arg: any) => any): any {
    if (clazz == null) return null;
    const m: any = (clazz as any).create;
    if (m) {
      return new Factory((arg: any) => {
        return m(arg);
      });
    }
    try {
      return new Factory((arg: any) => {
        return new clazz(arg);
      });
    } catch (err) {
      throw err;
    }
  }
  public make0: (arg: any) => ASTree;
  constructor(make0: (arg: any) => ASTree) {
    this.make0 = make0;
  }
  public make(arg: any): ASTree {
    return this.make0(arg);
  }
}

export class Parser {
  public static Element = Element;
  public static Tree = Tree;
  public static OrTree = OrTree;
  public static Repeat = Repeat;
  public static AToken = AToken;
  public static IdToken = IdToken;
  public static NumToken = NumToken;
  public static StrToken = StrToken;
  public static Leaf = Leaf;
  public static Skip = Skip;
  public static Precedence = Precedence;
  public static Operators = Operators;
  public static Expr = Expr;
  public static Factory = Factory;

  public elements: Element[] = [];
  public factory?: Factory;

  constructor(p: any) {
    if (p instanceof Parser) {
      this.elements = p.elements;
      this.factory = p.factory;
    } else {
      this.reset(p);
    }
  }

  public parse(lexer: Lexer): ASTree {
    const results: ASTree[] = [];
    for (let e of this.elements) e.parse(lexer, results);
    return this.factory!.make(results);
  }

  public match(lexer: Lexer) {
    if (this.elements.length == 0) return true;
    const e = this.elements[0];
    return e.match(lexer);
  }

  public static rule(clazz?: any) {
    // clazz为null时，默认为ASTList
    if (clazz != null) return new Parser(clazz);
    return new Parser(null);
  }

  public reset(clazz?: any) {
    if (clazz === undefined) {
      this.elements = [];
    } else {
      this.elements = [];
      this.factory = Factory.getForASTList(clazz);
    }
    return this;
  }
  public number(clazz?: any) {
    this.elements.push(new NumToken(clazz));
    return this;
  }

  public identifier(...args: any[]) {
    if (args.length === 1) {
      this.elements.push(new IdToken(undefined, args[0]));
    } else {
      this.elements.push(new IdToken(args[0], args[1]));
    }
    return this;
  }

  public string(clazz?: any) {
    this.elements.push(new StrToken(clazz));
    return this;
  }

  public token(...pat: string[]) {
    this.elements.push(new Leaf(pat));
    return this;
  }

  public sep(...pat: string[]) {
    this.elements.push(new Skip(pat));
    return this;
  }

  public ast(p: Parser) {
    this.elements.push(new Tree(p));
    return this;
  }

  public or(...p: Parser[]) {
    this.elements.push(new OrTree(p));
    return this;
  }

  public maybe(p: Parser) {
      const p2 = new Parser(p);
      p2.reset();
      this.elements.push(new OrTree([p, p2]));
      return this;
  }

  public option(p: Parser) {
    this.elements.push(new Repeat(p, true));
    return this;
  }

  public repeat(p: Parser) {
    this.elements.push(new Repeat(p, false));
    return this;
  }

  public expression(...args: any[]) {
    if (args.length == 2) {
      this.elements.push(new Expr(null, args[0], args[1]));
    } else {
      this.elements.push(new Expr(args[0], args[1], args[2]));
    }
    return this;
  }

  public insertChoice(p: Parser) {
    const e = this.elements[0];
    if (e instanceof OrTree) {
      (e as OrTree).insert(p);
    } else {
      const otherwise = new Parser(this);
      this.reset(null);
      this.or(p, otherwise);
    }
    return this;
  }
}
