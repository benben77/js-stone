import { BasicParser } from "../Stone/BasicParser";
import { Lexer } from "../Stone/Lexer";
import { Token } from "../Stone/Token";
import { LineNumberReader } from "../utils/LineNumberReader";

export default async (src: string) => {
  const reader = new LineNumberReader(src);
  await reader.init();
  const lexer = new Lexer(reader);
  const bp = new BasicParser();
  while (lexer.peek(0) != Token.EOF) {
    const ast = bp.parse(lexer);
    console.log("=>", ast.toString());
  }
};