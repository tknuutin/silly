
import { isObject } from '../util/utils';
import * as R from 'ramda';
import { State } from '../data/state';
import * as L from '../data/lenses';


export function parse(varId: string): string[] {
    return varId.split(':');
}

export function set(varId: string, value: number, state: State): State {
    const [namespace, ...additional] = parse(varId);
    if (namespace === 'global') {
        if (additional.length !== 1) {
            throw new Error('Invalid global var: ' + varId);
        }
        return R.set(
            L.compose(L.state.vars, R.lensProp(additional[0])),
            value,
            state
        );
    }
    if (namespace === 'player') {
        // debugger;
        const [name, ...more] = additional;
        if (name === 'health') {
            return R.set(L.state.playerHealth, value, state);
        }
        throw new Error('Unimplemented / unrecognized player var: ' + varId);
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
    const [namespace, ...additional] = parse(varId);
    if (namespace === 'global') {
        if (additional.length !== 1) {
            throw new Error('Invalid global var: ' + varId);
        }
        return state.vars[additional[0]];
    }
    if (namespace === 'player') {
        const [name, ...more] = additional;
        if (name === 'health') {
            return state.player.health;
        }
        throw new Error('Unimplemented / unrecognized player var: ' + varId);
    }
    throw new Error('Unknown var namespace: ' + namespace);
}
