
import { isObject } from './utils';
import * as R from 'ramda';
import { State } from './state';

export function parse(varId: string): string[] {
    return varId.split(':');
}

export function namespace(varId: string): string {
    return parse(varId)[0];
}

export function name(varId: string): string {
    return parse(varId)[1];
}

const lVars = R.lensProp('vars');

export function set(varId: string, value: number, state: State): State {
    const [namespace, name] = parse(varId);
    if (namespace === 'global') {
        const vars = R.set(R.lensProp(name), value, state.vars);
        state = R.set(lVars, vars, state);
    }
    return state;
}

function modifyWith(func: (x: number, y: number) => number) {
    return (varId: string, value: number, state: State): State => {
        const val = getValue(varId, state);
        return set(varId, func(val, value), state);
    };
}

export const add = modifyWith((x, y) => x + y);
export const sub = modifyWith((x, y) => x - y);
export const mul = modifyWith((x, y) => x * y);
export const div = modifyWith((x, y) => x / y);

export function getValue(state: any, varId: string): number {
    const [namespace, name] = parse(varId);
    if (namespace === 'global') {
        return state.vars[name];
    }

    throw new Error('Unknown var namespace: ' + namespace);
}
