import { ArrayEnv } from "../chap11/ArrayEnv";
import { OptFunction } from "../chap11/OptFunction";
import { Environment } from "../chap6/Environment";
import { BlockStmnt } from "../Stone/ast/BlockStmnt";
import { ParameterList } from "../Stone/ast/ParameterList";
import { OptStoneObject } from "./OptStoneObject";

export class OptMethod extends OptFunction {
  public self: OptStoneObject;

  constructor(
    parameters: ParameterList,
    body: BlockStmnt,
    env: Environment,
    memorySize: number,
    self: OptStoneObject,
  ) {
    super(parameters, body, env, memorySize);
    this.self = self;
  }

  public makeEnv() {
    const e = new ArrayEnv(this.size, this._env);
    e.put(0, 0, this.self);
    return e;
  }
}
