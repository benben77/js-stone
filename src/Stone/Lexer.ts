import { LineNumberReader } from "../utils/LineNumberReader";
import { ParseException } from "./ParseException";
import { Token } from "./Token";

function toStringLiteral(s: string): string {
	let sb = '';
	const len = s.length - 1;
	for (let i = 1; i < len; i++) {
		let c = s.charAt(i);
		if (c === '\\' && i + 1 < len) {
			const c2 = s.charAt(i + 1);
			if (c2 === '"' || c2 === '\\') {
				c = s.charAt(++i);
			} else if (c2 === 'n') {
				++i;
				c = '\n';
			}
		}
		sb += c;
	}
	return sb;
}

export class Lexer {
  private pattern = /\s*((\/\/.*)|([0-9]+)|("(\\"|\\\\|\\n|[^"])*")|[A-Za-z_][0-9A-Za-z_]*|==|<=|>=|&&|\|\||[!"#$%&'()*+,-./:;<=>?@\[\]^_`{|}~])?/g;
  private queue: Token[] = [];
  private hasMore: boolean;
  private reader: LineNumberReader;

  constructor(r: LineNumberReader) {
    this.hasMore = true;
    this.reader = r;
  }

  public read(): Token {
		if (this.fillQueue(0)) return this.queue.shift() as Token;
		return Token.EOF;
	}

	public peek(i: number): Token {
		if (this.fillQueue(i)) return this.queue[i];
		return Token.EOF;
	}

  private fillQueue(i: number): boolean {
    while (i >= this.queue.length) {
      if (this.hasMore) {
        this.readLine();
      } else {
        return false;
      }
    }
    return true;
  }

  protected readLine() {
		let line: string | null;
		try {
			line = this.reader.readLine();
		} catch (err) {
			throw new ParseException(err);
		}
		if (line == null) {
			this.hasMore = false;
			return;
		}
    const lineNo = this.reader.getLineNumber();
		let pos = 0;
		let endPos = line.length;
		while (pos < endPos) {
			const matched = this.pattern.exec(line);
			if (!matched) {
				throw new ParseException('bad token at line ' + lineNo);
			}
			pos += matched[0].length;
			this.addToken(lineNo, matched);
		}
		this.pattern.lastIndex = 0;
		this.queue.push(new IdToken(lineNo, Token.EOL));

	}

	protected addToken(lineNo: number, matched: string[]) {
		const m = matched[1];
		if (m) { // not space
			if (!matched[2]) { // not comment
				let token: Token;
				if (matched[3]) { // number
					token = new NumToken(lineNo, parseInt(m, 10));
				} else if (matched[4]) { // str
					token = new StrToken(lineNo, toStringLiteral(m));
				} else {
					token = new IdToken(lineNo, m);
				}
				this.queue.push(token);
			}
		}
	}
}

export class IdToken extends Token {
	private text: string;

	constructor(line: number, text: string) {
		super(line);
		this.text = text;
	}

	public isIdentifier() {
		return true;
	}

	public getText() {
		return this.text;
	}
}

export class NumToken extends Token {
	private value: number;

	constructor(line: number, value: number) {
		super(line);
		this.value = value;
	}

	public isNumber() {
		return true;
	}

	public getText() {
		return this.value.toString();
	}

	public getNumber() {
		return this.value;
	}
}

export class StrToken extends Token {
  private literal: string;

  constructor(line: number, literal: string) {
    super(line);
    this.literal = literal;
  }

  public isString() {
    return true;
  }

  public getText() {
    return this.literal;
  }
}
