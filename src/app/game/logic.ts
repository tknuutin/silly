
import * as R from 'ramda';
import * as Vars from './vars';
import { isString, isArray, isObject } from './utils';

import * as L from '../types/logic';
// import { isLogicAtom, isCombinator } from './typecheck';

type Condition = L.LogicAtom | L.Combinator;

function compare(state: any, expr: any, comparison: any) {
    const [var1, par] = expr;
    const gameVar = Vars.getValue(state, expr[0]);
    const compareTo = isString(par) ? Vars.getValue(state, expr[1]) : par;
    return comparison(gameVar, compareTo);
}

const COMP = {
    exists: (state: any, expr: any): boolean =>
        Vars.getValue(state, expr) !== undefined,
    eq: (state: any, expr: any) =>
        compare(state, expr, (x: number, y: number) => x === y),
    lt: (state: any, expr: any) =>
        compare(state, expr, (x: number, y: number) => x < y),
    lte: (state: any, expr: any) =>
        compare(state, expr, (x: number, y: number) => x <= y),
    gt: (state: any, expr: any) =>
        compare(state, expr, (x: number, y: number) => x > y),
    gte: (state: any, expr: any) =>
        compare(state, expr, (x: number, y: number) => x >= y)
};

function isAndComb(a: any): a is L.AndCombinator { return !!a.and; }
function isOrComb(a: any): a is L.OrCombinator { return !!a.or; }
function isAllComb(a: any): a is L.AllCombinator { return !!a.all; }
function isAnyComb(a: any): a is L.AnyCombinator { return !!a.any; }
function isNoneComb(a: any): a is L.NoneCombinator { return !!a.none; }
function isNotComb(a: any): a is L.NotCombinator { return !!a.not; }

const LOGIC_ATOM_KEYS = ['exists', 'eq', 'lt', 'lte', 'gt', 'gte', 'value'];
function isLogicAtom(a: any): a is L.LogicAtom {
    return R.any((val) => val !== undefined, R.map((key) => a[key], LOGIC_ATOM_KEYS));
}

export function isTrue(state: any, expr: Condition | undefined): boolean {
    // The expression being undefined itself means it is true.
    if (!expr) {
        return true;
    }

    if (!isObject(expr)) {
        throw new Error('Logic expression was not an object.');
    }

    if (isLogicAtom(expr)) {
        if (expr.value !== undefined) {
            return expr.value;    
        }
    }

    const callIsTrue = (e: Condition) => isTrue(state, e);

    if (isNoneComb(expr)) {
        return !R.any(callIsTrue, expr.none);
    }

    if (isAnyComb(expr)) {
        return R.any(callIsTrue, expr.any);   
    }

    if (isAllComb(expr)) {
        return R.all(callIsTrue, expr.all);
    }

    if (isOrComb(expr)) {
        return isTrue(state, expr.or[0]) || isTrue(state, expr.or[1]);
    }

    if (isAndComb(expr)) {
        return isTrue(state, expr.and[0]) && isTrue(state, expr.and[1]);
    }

    if (isNotComb(expr)) {
        return isFalse(state, expr.not);
    }

    // --------------------------------
    // Actual game world checks
    const notExistsOrIsTrue = (pair: any) => {
        const [key, func] = pair;
        if (expr[key]) {
            return func(state, expr[key]);
        }
        return true;
    };

    return R.all(notExistsOrIsTrue, R.toPairs(COMP));
    // --------------------
}

export function isFalse(state: any, expr: any): boolean {
    return !isTrue(state, expr);
}

