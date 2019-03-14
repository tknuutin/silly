
import * as Vars from '../game/vars';
import { isObject, findObjOperation } from '../util/utils';
import { State } from '../data/state';
import * as R from 'ramda';

const OPS = {
    add: (x: number, y: number): number => x + y,
    sub: (x: number, y: number): number => x - y,
    div: (x: number, y: number): number => x / y,
    mul: (x: number, y: number): number => x * y
};

export function resolveValue(state: State, expr: any): number {
    if (typeof expr === 'number') {
        return expr;
    }

    if (typeof expr === 'string') {
        return Vars.getValue(state, expr);
    }
    
    if (isObject(expr)) {
        const { opname, func } = findObjOperation(OPS, expr);

        if (!opname || !func) {
            throw new Error('Could not find correct math operation!');
        }

        const left = resolveValue(state, expr[opname][0]);
        const right = resolveValue(state, expr[opname][1]);
        return func(left, right);
    }

    throw new Error('Something strange happened while doing math!');
}

// console.log(resolveValue({}, { add: [4, 2] }));
// console.log(resolveValue({}, { mul: [4, { sub: [5, 4.2] }] }));


