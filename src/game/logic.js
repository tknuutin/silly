
import * as R from 'ramda';
import * as Vars from './vars';
import { isString } from './utils';

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

    if (expr.eq) {
        const [var1, par] = expr.eq;
        const gameVar = Vars.getValue(state, expr.eq[0]);
        const compareTo = isString(par) ? Vars.getValue(state, expr.eq[1]) : par;
        return gameVar === compareTo;
    }
}

export function isFalse(state, expr) {
    return !isTrue(state, expr);
}

