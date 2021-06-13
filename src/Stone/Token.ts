import { StoneException } from './StoneException';

export class Token {
  public static EOF: Token = new Token(-1);
  public static EOL: string = '\\n';

  constructor(private lineNumber: number) {}

  public getLineNumber() {
    return this.lineNumber;
  }

  public isIdentifier() {
    return false;
  }

  public isNumber() {
    return false;
  }

  public isString() {
    return false;
  }

  public getNumber() {
    throw new StoneException('not number token');
  }

  public getText() {
    return '';
  }

  public toString() {
    return this.getText();
  }
}
