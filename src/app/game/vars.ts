
import { isObject } from '../util/utils';
import * as R from 'ramda';
import { State } from '../data/state';
import * as L from '../data/lenses';


export function parse(varId: string): string[] {
    return varId.split(':');
}

export function namespace(varId: string): string {
    return parse(varId)[0];
}

export function name(varId: string): string {
    return parse(varId)[1];
}

export function set(varId: string, value: number, state: State): State {
    const [namespace, name] = parse(varId);
    if (namespace === 'global') {
        return R.set(
            L.compose(L.state.vars, R.lensProp(name)),
            value,
            state
        );
    }
    return state;
}

function modifyWith(func: (x: number, y: number) => number) {
    return (varId: string, value: number, state: State): State => {
        const val = getValue(state, varId);
        return set(varId, func(val, value), state);
    };
}

export const add = modifyWith((x, y) => x + y);
export const sub = modifyWith((x, y) => x - y);
export const mul = modifyWith((x, y) => x * y);
export const div = modifyWith((x, y) => x / y);

export function getValue(state: State, varId: string): number {
    const [namespace, name] = parse(varId);
    if (namespace === 'global') {
        return state.vars[name];
    }

    throw new Error('Unknown var namespace: ' + namespace);
}
