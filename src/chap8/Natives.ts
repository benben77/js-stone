import { Environment } from "../chap6/Environment";
import { NativeFunction } from "./NativeFunction";

export class Natives {
  public environment(env: Environment) {
    this.appendNatives(env);
    return env;
  }

  protected appendNatives(env: Environment) {
    this.append(env, "print", (msg: any) => {
      console.log(msg);
      return 0;
    });
    this.append(env, "currentTime", () => {
      return +new Date;
    });
  }

  protected append(env: Environment, name: string, method: Function) {
    env.put(name, new NativeFunction(name, method));
  }
}