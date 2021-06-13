import { ASTreeEx } from "../chap6/BasicEvaluator";
import { NestedEnv } from "../chap7/NestedEnv";
import { ASTree } from "../Stone/ast/ASTree";
import { NullStmnt } from "../Stone/ast/NullStmnt";
import { ClosureParser } from "../Stone/ClosureParser";
import { Lexer } from "../Stone/Lexer";
import { Token } from "../Stone/Token";
import { LineNumberReader } from "../utils/LineNumberReader";
import { Natives } from "./Natives";
import "./NativeEvaluator"; // side effect

export default async (src: string) => {
  const reader = new LineNumberReader(src);
  await reader.init();
  const lexer = new Lexer(reader);
  const bp = new ClosureParser();
  const env = new Natives().environment(new NestedEnv());
  while (lexer.peek(0) != Token.EOF) {
    const t = bp.parse(lexer);
    if (!(t instanceof NullStmnt)) {
      const r = (t as ASTree & ASTreeEx).eval(env);
      console.log("=>", r);
    }
  }
};