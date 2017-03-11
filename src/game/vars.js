
import { isObject } from './utils';
import * as R from 'ramda';

export function parse(varId) {
    return varId.split(':');
}

export function namespace(varId) {
    return parse(varId)[0];
}

export function name(varId) {
    return parse(varId)[1];
}

export function set(varId, value, state) {
    const [namespace, name] = parse(varId);
    if (namespace === 'global') {
        const vars = R.set(R.lensProp(name), value, state.vars);
        state = R.set(R.lensProp('vars'), vars, state);
    }
    return state;
}

export function getValue(state, varId) {
    const [namespace, name] = parse(varId);
    if (namespace === 'global') {
        return state.vars[name];
    }

    throw new Error('Unknown var namespace: ' + namespace);
}
