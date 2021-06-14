import { ASTreeEx } from "../chap6/BasicEvaluator";
import { NestedEnv } from "../chap7/NestedEnv";
import { Natives } from "../chap8/Natives";
import { ASTree } from "../Stone/ast/ASTree";
import { NullStmnt } from "../Stone/ast/NullStmnt";
import { ClassParser } from "../Stone/ClassParser";
import { Lexer } from "../Stone/Lexer";
import { Token } from "../Stone/Token";
import { LineNumberReader } from "../utils/LineNumberReader";
import "./ClassEvaluator"; // side effect

export default async (src: string) => {
  const reader = new LineNumberReader(src);
  await reader.init();
  const lexer = new Lexer(reader);
  const bp = new ClassParser();
  const env = new Natives().environment(new NestedEnv());
  while (lexer.peek(0) != Token.EOF) {
    const t = bp.parse(lexer);
    if (!(t instanceof NullStmnt)) {
      const r = (t as ASTree & ASTreeEx).eval(env);
      console.log("=>", r);
    }
  }
};
