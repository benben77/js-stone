import { ASTree } from './ast/ASTree';

export class StoneException extends Error {
  constructor(m: string, t?: ASTree) {
    super(t ? `${m} ${t.location}` : m);
  }
}
