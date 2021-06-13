import { ASTree } from "../Stone/ast/ASTree";
import { StoneException } from "../Stone/StoneException";

export class NativeFunction {
	protected numParams: number;
  protected _hashCode: string;
  constructor(protected name: string, protected method: Function) {
    this._hashCode = (+new Date()).toString(36);
    this.numParams = method.length; // 只能定长
  }

  public toString() {
		return "<native:" + this._hashCode + ">";
	}

  public numOfParameters() {
		return this.numParams;
	}

  public invoke(args: any[], tree: ASTree) {
		try {
			return this.method.call(null, ...args);
		} catch (e) {
			throw new StoneException("bad native function call: " + this.name, tree);
		}
	}
}