import { ASTreeEx } from '../chap6/BasicEvaluator';
import { Environment } from '../chap6/Environment';
import { Fun } from '../Stone/ast/Fun';
import './FuncEvaluator'; // for side effect
import { FunctionNode } from './FunctionNode';

(Fun.prototype as Fun & ASTreeEx).eval = function(env: Environment) {
  return new FunctionNode(this.parameters(), this.body(), env);
};
