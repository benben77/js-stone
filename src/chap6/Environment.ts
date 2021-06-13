export interface Environment {
  put(...args: any[]): void;
  get(...args: any[]): any;
  has(...args: any[]): boolean;
}
