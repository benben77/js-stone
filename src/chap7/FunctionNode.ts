import { Environment } from "../chap6/Environment";
import { BlockStmnt } from "../Stone/ast/BlockStmnt";
import { ParameterList } from "../Stone/ast/ParameterList";
import { NestedEnv } from "./NestedEnv";

export class FunctionNode {
  protected _parameters: ParameterList;
  protected _body: BlockStmnt;
  protected _env: Environment;
  protected _hashCode: string; // 原代码为java的hashCode()，这里先随便生成一个吧

  constructor(parameters: ParameterList, body: BlockStmnt, env: Environment) {
    this._parameters = parameters;
    this._body = body;
    this._env = env;
    this._hashCode = (+new Date()).toString(36);
  }
  
  public parameters() {
    return this._parameters;
  }
  
  public body() {
    return this._body;
  }
  
  public makeEnv(): Environment {
    return new NestedEnv(this._env);
  }
  
  public toString() {
    return "<fun:" + this._hashCode + ">";
  }
}
