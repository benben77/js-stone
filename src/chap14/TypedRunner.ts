import { ASTreeOptEx, EnvEx2 } from "../chap11/EnvOptimizer";
import { StoneVMEnv } from "../chap13/StoneVMEnv";
import { ASTreeEx } from "../chap6/BasicEvaluator";
import { ASTree } from "../Stone/ast/ASTree";
import { NullStmnt } from "../Stone/ast/NullStmnt";
import { Lexer } from "../Stone/Lexer";
import { Token } from "../Stone/Token";
import { TypedParser } from "../Stone/TypedParser";
import { LineNumberReader } from "../utils/LineNumberReader";
import { ASTreeTypeEx } from "./TypeChecker";
import { TypeEnv } from "./TypeEnv";
import TypeInfo from "./TypeInfo";
import { TypedNatives } from "./TypedNatives";
import "./TypeChecker";

export default async (src: string) => {
  const reader = new LineNumberReader(src);
  await reader.init();
  const lexer = new Lexer(reader);
  const bp = new TypedParser();
  const te = new TypeEnv();
  const env = new TypedNatives(te).environment(new StoneVMEnv(100000, 100000, 1000));
  while (lexer.peek(0) != Token.EOF) {
    const t = bp.parse(lexer);
    if (!(t instanceof NullStmnt)) {
      (t as ASTree & ASTreeOptEx).lookup((env as EnvEx2).symbols());
      const type: TypeInfo | null = (t as ASTree & ASTreeTypeEx).typeCheck(te);
      const r = (t as ASTree & ASTreeEx).eval(env);
      console.log("=>", r, " : " + type);
    }
  }
};