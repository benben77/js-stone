import { StoneException } from "../Stone/StoneException";
import { StoneVM } from "./StoneVM";

export class Opcode {
  public static ICONST = 1; // load an integer
	// public static BCONST = 2; // load an 8bit (1byte) integer
	// public static SCONST = 3; // load a character string
	public static MOVE = 4; // move a value
	public static GMOVE = 5; // move a value (global variable)
	public static IFZERO = 6; // branch if false
	public static GOTO = 7; // always branch
	public static CALL = 8; // call a function
	public static RETURN = 9; // return
	public static SAVE = 10; // save all registers
	public static RESTORE = 11; // restore all registers
	public static NEG = 12; // arithmetic negation
	public static ADD = 13; // add
	public static SUB = 14; // subtract
	public static MUL = 15; // multiply
	public static DIV = 16; // divide
	public static REM = 17; // remainder
	public static EQUAL = 18; // equal
	public static MORE = 19; // more than
	public static LESS = 20; // less than

  public static encodeRegister(reg: number) {
		if (reg > StoneVM.NUM_OF_REG)
			throw new StoneException("too many registers required");
		else
			return -(reg + 1);
	}

  public static decodeRegister(operand: number) {
		return -1 - operand;
	}

  public static encodeOffset(offset: number) {
		// 原代码：判断是否在Byte范围
		return offset;
	}

  public static encodeShortOffset(offset: number) {
    // 原代码：判断是否在Short范围
		return offset;
	}

  public static decodeOffset(operand: number) {
		return operand;
	}

	public static isRegister(operand: number) {
		return operand < 0;
	}

	public static isOffset(operand: number) {
		return operand >= 0;
	}
}
