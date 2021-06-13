import { Token } from "../Token";
import { ASTree } from "./ASTree";

export class ASTLeaf<T extends Token> implements ASTree {
  private static empty: ASTree[] = [];

  constructor(protected _token: T) {}
  
  public child(i: number): ASTree {
		throw new Error('IndexOutOfBoundsException');
  }
  
  public numChildren() {
    return 0;
  }

  public children() {
    return ASTLeaf.empty;
  }

  public toString() {
    return this._token.getText();
  }

  public location() {
		return "at line " + this._token.getLineNumber();
  }
  
  public iterator() {
    return this.children();
  }

	public token() {
		return this._token;
	}
}
