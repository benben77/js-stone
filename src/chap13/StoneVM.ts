import { NativeFunction } from "../chap8/NativeFunction";
import { ASTList } from "../Stone/ast/ASTList";
import { StoneException } from "../Stone/StoneException";
import { HeapMemory } from "./HeapMemory";
import { Opcode } from "./Opcode";
import { VmFunction } from "./VmFunction";

export class StoneVM {
	public static NUM_OF_REG = 6;
	public static SAVE_AREA_SIZE = StoneVM.NUM_OF_REG + 2;

	public static TRUE = 1;
	public static FALSE = 0;

  public code: number[];
	public stack: any[];
	public strings: string[];
	public heap: HeapMemory;

	public pc = 0; // 程序计数器
  public fp = 0; // 帧指针
  public sp = 0; // 栈指针
  public ret = -1;
	protected registers: any[];

  constructor(codeSize: number, stackSize: number, stringsSize: number, hm: HeapMemory) {
		this.code = new Array(codeSize);
		this.stack = new Array(stackSize);
		this.strings = new Array(stringsSize);
		this.registers = new Array(StoneVM.NUM_OF_REG);
		this.heap = hm;
	}

  public getReg(i: number) {
		return this.registers[i];
	}

	public setReg(i: number, value: any) {
		this.registers[i] = value;
	}

  public run(entry: number) {
		this.pc = entry;
		this.fp = 0;
		this.sp = 0;
		this.ret = -1;
		while (this.pc >= 0)
			this.mainLoop();
	}

  protected mainLoop() {
    const { code, pc, registers, ret } = this;
    const { decodeRegister } = Opcode;
    const { readShort, readInt } = StoneVM;
		switch (code[pc]) {
		  case Opcode.ICONST:
        registers[decodeRegister(code[pc + 2])] = readInt(code, pc + 1);
        this.pc += 3;
        break;
      case Opcode.MOVE:
        this.moveValue();
        break;
      case Opcode.GMOVE:
        this.moveHeapValue();
        break;
      case Opcode.IFZERO:
        const value = registers[decodeRegister(code[pc + 1])];
        if (typeof value === 'number' && value === 0)
          this.pc += readShort(code, pc + 2);
        else
          this.pc += 3;
        break;
      case Opcode.GOTO:
        this.pc += readShort(code, pc + 1);
        break;
      case Opcode.CALL:
        this.callFunction();
        break;
      case Opcode.RETURN:
        this.pc = ret;
        break;
      case Opcode.SAVE:
        this.saveRegisters();
        break;
      case Opcode.RESTORE:
        this.restoreRegisters();
        break;
		case Opcode.NEG:
			const reg = decodeRegister(code[pc + 1]);
			const v = registers[reg];
			if (typeof v === 'number')
				registers[reg] = -v;
			else
				throw new StoneException("bad operand value");
			this.pc += 2;
			break;
		default:
			if (code[pc] > Opcode.LESS)
				throw new StoneException("bad instruction");
			else
				this.computeNumber();
			break;
		}
	}

  protected moveValue() {
    const { code, pc, registers, stack, fp } = this;
    const { isRegister, decodeRegister, decodeOffset } = Opcode;
		const src = code[pc + 1];
		const dest = code[pc + 2];
		let value;
		if (isRegister(src))
			value = registers[decodeRegister(src)];
		else
			value = stack[fp + decodeOffset(src)];
		if (isRegister(dest))
			registers[decodeRegister(dest)] = value;
		else
			stack[fp + decodeOffset(dest)] = value;
		this.pc += 3;
	}

  protected moveHeapValue() {
    const { code, pc, heap, registers } = this;
    const { isRegister, decodeRegister } = Opcode;
    const { readShort } = StoneVM;
		const rand = code[pc + 1];
		if (isRegister(rand)) {
			const dest = readShort(code, pc + 2);
			heap.write(dest, registers[decodeRegister(rand)]);
		} else {
			const src = readShort(code, pc + 1);
			registers[decodeRegister(code[pc + 2])] = heap.read(src);
		}
		this.pc += 3;
	}

  protected callFunction() {
    const { code, pc, registers, stack, sp } = this;
    const { decodeRegister } = Opcode;
		const value = registers[decodeRegister(code[pc + 1])];
		const numOfArgs = code[pc + 2];
		if (value instanceof VmFunction && (value as VmFunction).parameters().size() == numOfArgs) {
			this.ret = pc + 3;
			this.pc = (value as VmFunction).entry();
		} else if (value instanceof NativeFunction && (value as NativeFunction).numOfParameters() == numOfArgs) {
			const args = new Array(numOfArgs);
			for (let i = 0; i < numOfArgs; i++)
				args[i] = stack[sp + i];
			stack[sp] = (value as NativeFunction).invoke(args, new ASTList([]));
			this.pc += 3;
		} else {
			throw new StoneException("bad function call");
    }
	}

  protected saveRegisters() {
    const { code, pc, sp, fp, stack, registers, ret } = this;
    const { decodeOffset } = Opcode;
    const { NUM_OF_REG, SAVE_AREA_SIZE } = StoneVM;
		const size = decodeOffset(code[pc + 1]);
		let dest = size + sp;
		for (let i = 0; i < NUM_OF_REG; i++)
			stack[dest++] = registers[i];
		stack[dest++] = fp;
		this.fp = sp;
		this.sp += size + SAVE_AREA_SIZE;
		stack[dest++] = ret;
		this.pc += 2;
	}

  protected restoreRegisters() {
    const { code, pc, fp, registers, stack } = this;
    const { decodeOffset } = Opcode;
    const { NUM_OF_REG } = StoneVM;
		let dest = decodeOffset(code[pc + 1]) + fp;
		for (let i = 0; i < NUM_OF_REG; i++)
			registers[i] = stack[dest++];
		this.sp = fp;
		this.fp = stack[dest++];
		this.ret = stack[dest++];
		this.pc += 2;
	}

  protected computeNumber() {
    const { code, pc, registers } = this;
    const { decodeRegister } = Opcode;
    const { TRUE, FALSE } = StoneVM;
		const left = decodeRegister(code[pc + 1]);
		const right = decodeRegister(code[pc + 2]);
		const v1 = registers[left];
		const v2 = registers[right];
		const areNumbers = typeof v1 === 'number' && typeof v2 === 'number';
		if (code[pc] == Opcode.ADD && !areNumbers) {
			registers[left] = v1 + v2;
    } else if (code[pc] == Opcode.EQUAL && !areNumbers) {
			registers[left] = v1 == v2 ? TRUE : FALSE; // equals
		} else {
			if (!areNumbers)
				throw new StoneException("bad operand value");
			const i1 = v1 as number;
			const i2 = v2 as number;
			let i3: number;
			switch (code[pc]) {
			  case Opcode.ADD:
          i3 = i1 + i2;
          break;
        case Opcode.SUB:
          i3 = i1 - i2;
          break;
        case Opcode.MUL:
          i3 = i1 * i2;
          break;
        case Opcode.DIV:
          i3 = i1 / i2;
          break;
        case Opcode.REM:
          i3 = i1 % i2;
          break;
        case Opcode.EQUAL:
          i3 = i1 === i2 ? TRUE : FALSE;
          break;
        case Opcode.MORE:
          i3 = i1 > i2 ? TRUE : FALSE;
          break;
        case Opcode.LESS:
          i3 = i1 < i2 ? TRUE : FALSE;
          break;
        default:
          throw new StoneException("never reach here");
      }
			registers[left] = i3;
		}
		this.pc += 3;
	}

  public static readInt(array: number[], index: number) {
		return array[index];
	}

  public static readShort(array: number[], index: number) {
		return array[index];
	}
}
