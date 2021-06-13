import { ASTree } from "./ASTree";

export class ASTList implements ASTree {
  constructor(protected _children: ASTree[]) {}

  public child(i: number) {
    return this._children[i];
  }

  public numChildren() {
    return this._children.length;
  }

  public children() {
    return this._children;
  }

  public toString() {
    let sb = '(';
		let sep = '';
		for (let t of this._children) {
			sb += sep;
      sep = ' ';
      sb += t.toString();
    }
		return sb + ')';
  }

  public location() {
    for(let t of this._children) {
			const s = t.location();
			if (s != null) return s;
		}
		return null;
  }

  public iterator() {
    return this.children();
  }
}
