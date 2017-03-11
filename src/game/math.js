
import * as Vars from './vars';
import { isObject, findObjOperation } from './utils';
import * as R from 'ramda';

const OPS = {
    add: (x, y) => x + y,
    sub: (x, y) => x - y,
    div: (x, y) => x / y,
    mul: (x, y) => x * y
};

export function resolveValue(state, expr) {
    if (typeof expr === 'number') {
        return expr;
    }

    if (typeof expr === 'string') {
        return Vars.getValue(state, expr);
    }
    
    if (isObject(expr)) {
        const { opname, func } = findObjOperation(OPS, expr);
        const left = resolveValue(state, expr[opname][0]);
        const right = resolveValue(state, expr[opname][1]);
        return func(left, right);
    }

    throw new Error('Something strange happened while doing math!');
}

// console.log(resolveValue({}, { add: [4, 2] }));
// console.log(resolveValue({}, { mul: [4, { sub: [5, 4.2] }] }));


