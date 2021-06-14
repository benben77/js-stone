import { EnvEx2 } from "../chap11/EnvOptimizer";
import "../chap12/InlineCache";
import { ASTreeEx } from "../chap6/BasicEvaluator";
import { Environment } from "../chap6/Environment";
import { Arguments } from "../Stone/ast/Arguments";
import { ASTList } from "../Stone/ast/ASTList";
import { ASTree } from "../Stone/ast/ASTree";
import { BinaryExpr } from "../Stone/ast/BinaryExpr";
import { BlockStmnt } from "../Stone/ast/BlockStmnt";
import { DefStmnt } from "../Stone/ast/DefStmnt";
import { IfStmnt } from "../Stone/ast/IfStmnt";
import { Name } from "../Stone/ast/Name";
import { NegativeExpr } from "../Stone/ast/NegativeExpr";
import { NumberLiteral } from "../Stone/ast/NumberLiteral";
import { ParameterList } from "../Stone/ast/ParameterList";
import { PrimaryExpr } from "../Stone/ast/PrimaryExpr";
import { StringLiteral } from "../Stone/ast/StringLiteral";
import { WhileStmnt } from "../Stone/ast/WhileStmnt";
import { StoneException } from "../Stone/StoneException";
import { Code } from "./Code";
import { Opcode } from "./Opcode";
import { StoneVM } from "./StoneVM";
import { VmFunction } from "./VmFunction";

const { encodeRegister } = Opcode;

export interface EnvEx3 extends EnvEx2 {
  stoneVM(): StoneVM;
  code(): Code;
}

export interface ASTreeVmEx extends ASTree {
  compile(c: Code): void;
}

Object.assign(ASTList.prototype as any, {
  compile(c: Code) {
    for (let t of this.children())
      (t as ASTreeVmEx).compile(c);
  }
} as ASTList & ASTreeVmEx);

Object.assign(DefStmnt.prototype as any, {
  eval(env: Environment) {
    const funcName = this.name();
    const vmenv = env as EnvEx3;
    const code = vmenv.code();
    const entry = code.position();
    this.compile(code);
    vmenv.putNew(funcName, new VmFunction(this.parameters(), this.body(), env, entry));
    return funcName;
  },
	compile(c: Code) {
    const { SAVE, MOVE, RESTORE, RETURN, encodeOffset } = Opcode;
    const { size } = this;
    c.nextReg = 0;
    c.frameSize = size + StoneVM.SAVE_AREA_SIZE;
    c.add(SAVE);
    c.add(encodeOffset(size));
    (this.body() as any as ASTreeVmEx).compile(c)
    c.add(MOVE);
    c.add(encodeRegister(c.nextReg - 1));
    c.add(encodeOffset(0));
    c.add(RESTORE);
    c.add(encodeOffset(size));
    c.add(RETURN);
  }
} as DefStmnt & ASTreeEx & ASTreeVmEx & { size: number });

Object.assign(ParameterList.prototype as any, {
  eval(env: Environment, index: number, value: any) {
    const vm = (env as EnvEx3).stoneVM();
    vm.stack[this.offsets[index]] = value;
  }
} as ParameterList & { offsets: any[], eval(env: Environment, index: number, value: any): void });

Object.assign(NumberLiteral.prototype as any, {
  compile(c: Code) {
    const v = this.value();
    c.add(Opcode.ICONST);
    c.add(v);
    c.add(encodeRegister(c.nextReg++));
  }
} as NumberLiteral & ASTreeVmEx);

Object.assign(StringLiteral.prototype as any, {
  compile(c: Code) {
    const i = c.record(this.value());
    c.add(Opcode.ICONST);
    c.add(Opcode.encodeShortOffset(i));
    c.add(encodeRegister(c.nextReg++));
  }
} as StringLiteral & ASTreeVmEx);

Object.assign(Name.prototype as any, {
  compile(c: Code) {
    if (this.nest > 0) {
      c.add(Opcode.GMOVE);
      c.add(Opcode.encodeShortOffset(this.index));
      c.add(encodeRegister(c.nextReg++));
    } else {
      c.add(Opcode.MOVE);
      c.add(Opcode.encodeOffset(this.index));
      c.add(encodeRegister(c.nextReg++));
    }
  },
  compileAssign(c: Code) {
    if (this.nest > 0) {
      c.add(Opcode.GMOVE);
      c.add(encodeRegister(c.nextReg - 1));
      c.add(Opcode.encodeShortOffset(this.index));
    } else {
      c.add(Opcode.MOVE);
      c.add(encodeRegister(c.nextReg - 1));
      c.add(Opcode.encodeOffset(this.index));
    }
  }
} as Name & ASTreeVmEx & { nest: number, index: number, compileAssign(c: Code): void });

Object.assign(NegativeExpr.prototype as any, {
  compile(c: Code) {
    (this.operand() as ASTreeVmEx).compile(c);
    c.add(Opcode.NEG);
    c.add(encodeRegister(c.nextReg - 1));
  }
} as NegativeExpr & ASTreeVmEx);

Object.assign(BinaryExpr.prototype as any, {
  compile(c: Code) {
    const op = this.operator();
			if (op === "=") {
				const l = this.left();
				if (l instanceof Name) {
					(this.right() as ASTreeVmEx).compile(c);
					(l as any).compileAssign(c);
				} else
					throw new StoneException("bad assignment", this);
			} else {
				(this.left() as ASTreeVmEx).compile(c);
				(this.right() as ASTreeVmEx).compile(c);
				c.add(this.getOpcode(op));
				c.add(encodeRegister(c.nextReg - 2));
				c.add(encodeRegister(c.nextReg - 1));
				c.nextReg--;
			}
  },
  getOpcode(op: string) {
    if (op === "+")
      return Opcode.ADD;
    else if (op === "-")
      return Opcode.SUB;
    else if (op === "*")
      return Opcode.MUL;
    else if (op === "/")
      return Opcode.DIV;
    else if (op === "%")
      return Opcode.REM;
    else if (op === "==")
      return Opcode.EQUAL;
    else if (op === ">")
      return Opcode.MORE;
    else if (op === "<")
      return Opcode.LESS;
    else
      throw new StoneException("bad operator", this);
		}
} as BinaryExpr & ASTreeVmEx & { getOpcode(op: string): number });

Object.assign(PrimaryExpr.prototype as any, {
  compile(c: Code) {
    this.compileSubExpr(c, 0);
  },
  compileSubExpr(c: Code, nest: number) {
			if (this.hasPostfix(nest)) {
				this.compileSubExpr(c, nest + 1);
				(this.postfix(nest) as ASTreeVmEx).compile(c);
			} else
				(this.operand() as ASTreeVmEx).compile(c);
	}
} as PrimaryExpr & ASTreeVmEx & {
  compileSubExpr(c: Code, nest: number): void,
  hasPostfix(nest: number): boolean,
  postfix(nest: number): any,
  operand(): any;
});

Object.assign(Arguments.prototype as any, {
  compile(c: Code) {
    let newOffset = c.frameSize;
    let numOfArgs = 0;
    for (let a of this.children()) {
      (a as ASTreeVmEx).compile(c);
      c.add(Opcode.MOVE);
      c.add(encodeRegister(--c.nextReg));
      c.add(Opcode.encodeOffset(newOffset++));
      numOfArgs++;
    }
    c.add(Opcode.CALL);
    c.add(encodeRegister(--c.nextReg));
    c.add(Opcode.encodeOffset(numOfArgs));
    c.add(Opcode.MOVE);
    c.add(Opcode.encodeOffset(c.frameSize));
    c.add(encodeRegister(c.nextReg++));
  },
  eval(env: Environment, value: any) {
    if (!(value instanceof VmFunction))
      throw new StoneException("bad function", this);
    const func = value as VmFunction;
    const params = func.parameters();
    if (this.size() != params.size())
      throw new StoneException("bad number of arguments", this);
    let num = 0;
    for (let a of this.children())
      (params as any).eval(env, num++, (a as any).eval(env));
    const svm = (env as EnvEx3).stoneVM();
    svm.run(func.entry());
    return svm.stack[0];
  }
} as Arguments & ASTreeVmEx & {
  eval(env: Environment, value: any): any;
});

Object.assign(BlockStmnt.prototype as any, {
  compile(c: Code) {
    if (this.numChildren() > 0) {
      let initReg = c.nextReg;
      for (let a of this.children()) {
        c.nextReg = initReg;
        (a as ASTreeVmEx).compile(c);
      }
    } else {
      c.add(Opcode.ICONST);
      c.add(0);
      c.add(encodeRegister(c.nextReg++));
    }
  }
} as BlockStmnt & ASTreeVmEx & {
  //
});

Object.assign(IfStmnt.prototype as any, {
  compile(c: Code) {
    (this.condition() as ASTreeVmEx).compile(c);
    let pos = c.position();
    c.add(Opcode.IFZERO);
    c.add(encodeRegister(--c.nextReg));
    c.add(Opcode.encodeShortOffset(0));
    const oldReg = c.nextReg;
    (this.thenBlock() as ASTreeVmEx).compile(c);
    const pos2 = c.position();
    c.add(Opcode.GOTO);
    c.add(Opcode.encodeShortOffset(0));
    c.set(Opcode.encodeShortOffset(c.position() - pos), pos + 2);
    const b = this.elseBlock();
    c.nextReg = oldReg;
    if (b != null)
      (b as ASTreeVmEx).compile(c);
    else {
      c.add(Opcode.ICONST);
      c.add(0);
      c.add(encodeRegister(c.nextReg++));
    }
    c.set(Opcode.encodeShortOffset(c.position() - pos2), pos2 + 1);
  }
} as IfStmnt & ASTreeVmEx & {
  //
});

Object.assign(WhileStmnt.prototype as any, {
  compile(c: Code) {
    const oldReg = c.nextReg;
    c.add(Opcode.ICONST);
    c.add(0);
    c.add(encodeRegister(c.nextReg++));
    const pos = c.position();
    (this.condition() as ASTreeVmEx).compile(c);
    const pos2 = c.position();
    c.add(Opcode.IFZERO);
    c.add(encodeRegister(--c.nextReg));
    c.add(Opcode.encodeShortOffset(0));
    c.nextReg = oldReg;
    (this.body() as ASTreeVmEx).compile(c);
    const pos3 = c.position();
    c.add(Opcode.GOTO);
    c.add(Opcode.encodeShortOffset(pos - pos3));
    c.set(Opcode.encodeShortOffset(c.position() - pos2), pos2 + 2);
  }
} as WhileStmnt & ASTreeVmEx & {
  //
});
