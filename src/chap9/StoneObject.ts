import { Environment } from "../chap6/Environment";
import { EnvEx } from "../chap7/NestedEnv";

export class AccessException extends Error {
}

export class StoneObject {
  protected _hashCode: string;
  constructor(protected env: Environment) {
    this._hashCode = (+new Date()).toString(36);
  }

  public toString() {
		return "<object:" + this._hashCode + ">";
	}

	public read(member: string){
		return this.getEnv(member).get(member);
	}

	public write(member: string, value: any) {
		(this.getEnv(member) as EnvEx).putNew(member, value);
	}

	protected getEnv(member: string) {
		const e = (this.env as EnvEx).where(member);
		if (e != null && e === this.env) return e;
		throw new AccessException();
	}
}
