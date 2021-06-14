import { ASTreeEx } from "../chap6/BasicEvaluator";
import { Natives } from "../chap8/Natives";
import { ArrayParser } from "../Stone/ArrayParser";
import { ASTree } from "../Stone/ast/ASTree";
import { NullStmnt } from "../Stone/ast/NullStmnt";
import { Lexer } from "../Stone/Lexer";
import { Token } from "../Stone/Token";
import { LineNumberReader } from "../utils/LineNumberReader";
import { ASTreeOptEx, EnvEx2 } from "./EnvOptimizer";
import { ResizableArrayEnv } from "./ResizableArrayEnv";
import "./EnvOptimizer"; // side effect

export default async (src: string) => {
  const reader = new LineNumberReader(src);
  await reader.init();
  const lexer = new Lexer(reader);
  const bp = new ArrayParser();
  const env = new Natives().environment(new ResizableArrayEnv());
  while (lexer.peek(0) != Token.EOF) {
    const t = bp.parse(lexer);
    if (!(t instanceof NullStmnt)) {
      (t as ASTree & ASTreeOptEx).lookup((env as EnvEx2).symbols());
      const r = (t as ASTree & ASTreeEx).eval(env);
      console.log("=>", r);
    }
  }
};