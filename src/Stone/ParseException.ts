import { Token } from "./Token";

const location = (t: Token): string => {
  if (t == Token.EOF) return "the last line";
  return "\"" + t.getText() + "\" at line " + t.getLineNumber();
};

export class ParseException extends Error {
  constructor(first: any, second?: any) {
    if (typeof first === 'string') {
      super(first);
    } else if (first instanceof Error) {
      super(first.message);
    } else if (first instanceof Token) {
      super("syntax error around " + location(first) + ". " + (second || ''));
    }
  }
}
