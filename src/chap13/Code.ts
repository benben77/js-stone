import { StoneVM } from "./StoneVM";

export class Code {
	protected svm: StoneVM;
	protected codeSize: number;
	protected numOfStrings: number;
	public nextReg = 0;
	public frameSize = 0;

	constructor(stoneVm: StoneVM) {
		this.svm = stoneVm;
		this.codeSize = 0;
		this.numOfStrings = 0;
	}

	public position() {
		return this.codeSize;
	}

	public set(value: number, pos: number) {
		this.svm.code[pos] = value;
	}

	public add(b: number) {
		this.svm.code[this.codeSize++] = b;
	}

	public record(s: string) {
		this.svm.strings[this.numOfStrings] = s;
		return this.numOfStrings++;
	}
}
