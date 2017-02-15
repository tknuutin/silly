
import * as R from 'ramda';
import * as Vars from './vars';

export function isTrue(state, expr) {
    if (!expr) {
        return true;
    }

    if (!(typeof expr === 'object')) {
        throw new Error('Logic expression was not an object.');
    }

    if (expr.exists) {
        return R.all((id) => !!Vars.getValue(state, id), expr.exists);
    }
}

export function isFalse(state, expr) {
    return !isTrue(state, expr);
}

