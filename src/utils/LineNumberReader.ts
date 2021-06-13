import * as fs from 'fs';
import * as readline from 'readline';

export class LineNumberReader {
  private currentLineNumber = 0;
  private data: string[] = [];

  constructor(private path: string) {}

  async init() {
    this.data = await readFile(this.path);
  }

  readLine() {
    let line: string | null = null;
    if (this.currentLineNumber < this.data.length) {
      line = this.data[this.currentLineNumber];
      this.currentLineNumber++;
    }
    return line;    
  }

  getLineNumber() {
    return this.currentLineNumber;
  }
}
    
function readFile(path: string): Promise<string[]> {
  return new Promise(resolve => {
    const fRead = fs.createReadStream(path);
    const reader = readline.createInterface({
        input: fRead,
    });
    const arr: string[] = [];
    reader.on('line', (line: string) => {
      arr.push(line);
    });
    reader.on('close',function () {
      resolve(arr);
    });
  });
}
