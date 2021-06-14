export interface HeapMemory {
	read(index: number): any;
	write(index: number, v: any): void;
}
