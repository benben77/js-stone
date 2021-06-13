export interface ASTree {
  child(i: number): ASTree;
  numChildren(): number;
  children(): ASTree[];
  location(): string | null;
  iterator(): ASTree[];
}
