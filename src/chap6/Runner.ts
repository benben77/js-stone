import { ASTree } from "../Stone/ast/ASTree";
import { NullStmnt } from "../Stone/ast/NullStmnt";
import { BasicParser } from "../Stone/BasicParser";
import { Lexer } from "../Stone/Lexer";
import { Token } from "../Stone/Token";
import { LineNumberReader } from "../utils/LineNumberReader";
import { BasicEnv } from "./BasicEnv";
import { ASTreeEx } from "./BasicEvaluator";
import "./BasicEvaluator"; // side effect

export default async (src: string) => {
  const reader = new LineNumberReader(src);
  await reader.init();
  const lexer = new Lexer(reader);
  const bp = new BasicParser();
  const env = new BasicEnv();
  while (lexer.peek(0) != Token.EOF) {
    const t = bp.parse(lexer);
    if (!(t instanceof NullStmnt)) {
      const r = (t as ASTree & ASTreeEx).eval(env);
      console.log("=>", r);
    }
  }
};