import { Natives } from "../chap8/Natives";
import { TypeEnv } from "./TypeEnv";

export class TypedNatives extends Natives {
  constructor(protected typeEnv: TypeEnv) {
    super();
  }

  // TODO: 支持原生方法

  // protected append(env: Environment, name: string, clazz: any, methodName: string, type: TypeInfo, params: any[]) {
	// 	super.append(env, name, clazz, methodName, params);
	// 	int index = ((EnvEx2) env).symbols().find(name);
	// 	typeEnv.put(0, index, type);
	// }

	// protected void appendNatives(Environment env) {
	// 	this.append(env, "print", chap14.java.print.class, "m", TypeInfo.function(TypeInfo.INT, TypeInfo.ANY), Object.class);
	// 	this.append(env, "read", chap14.java.read.class, "m", TypeInfo.function(TypeInfo.STRING));
	// 	this.append(env, "length", chap14.java.length.class, "m", TypeInfo.function(TypeInfo.INT, TypeInfo.STRING),
	// 			String.class);
	// 	this.append(env, "toInt", chap14.java.toInt.class, "m", TypeInfo.function(TypeInfo.INT, TypeInfo.ANY), Object.class);
	// 	this.append(env, "currentTime", chap14.java.currentTime.class, "m", TypeInfo.function(TypeInfo.INT));
	// }
}
