
import * as R from 'ramda';
import * as Vars from './vars';
import { isString, isArray, isObject } from './utils';

function compare(state, expr, comparison) {
    const [var1, par] = expr;
    const gameVar = Vars.getValue(state, expr[0]);
    const compareTo = isString(par) ? Vars.getValue(state, expr[1]) : par;
    return comparison(gameVar, compareTo);
}

const COMP = {
    exists: (state, expr) => Vars.getValue(state, expr) !== undefined,
    eq: (state, expr) => compare(state, expr, (x, y) => x === y),
    lt: (state, expr) => compare(state, expr, (x, y) => x < y),
    lte: (state, expr) => compare(state, expr, (x, y) => x <= y),
    gt: (state, expr) => compare(state, expr, (x, y) => x > y),
    gte: (state, expr) => compare(state, expr, (x, y) => x >= y)
};

export function isTrue(state, expr) {
    // debugger;
    // The expression being undefined itself means it is true.
    if (!expr) {
        return true;
    }

    if (!isObject(expr)) {
        throw new Error('Logic expression was not an object.');
    }

    if (expr.value) {
        return expr.value;
    }

    const callIsTrue = (e) => isTrue(state, e);

    // --------------------------------
    // Combinators
    if (expr.none) {
        return !R.any(callIsTrue, expr.none);
    }

    if (expr.any) {
        return R.any(callIsTrue, expr.none);   
    }

    if (expr.all) {
        return R.all(callIsTrue, expr.all)
    }

    if (expr.or) {
        return isTrue(state, expr.or[0]) || isTrue(state, expr.or[1]);
    }

    if (expr.and) {
        return isTrue(state, expr.or[0]) && isTrue(state, expr.or[1]);
    }

    if (expr.not) {
        return isFalse(state, expr.not);
    }
    // --------------------------------

    // --------------------------------
    // Actual game world checks
    const notExistsOrIsTrue = (pair) => {
        const [key, func] = pair;
        if (expr[key]) {
            return func(state, expr[key]);
        }
        return true;
    }
    return R.all(notExistsOrIsTrue, R.toPairs(COMP));
    // --------------------------------
}

export function isFalse(state, expr) {
    return !isTrue(state, expr);
}

