
import * as R from 'ramda';

export function randomChoice<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)];
}

export function isString(val: any): val is string {
    return typeof val === 'string';
}

export function isObject(val: any): val is object {
    return val !== null && typeof val === 'object';
}

export function isArray<T>(val: any): val is Array<T> {
    return typeof val === 'object' && val.length;
}

export function ensureArray<T>(val: any): T[] {
    return isArray<T>(val) ? val : [val];
}

export function trunc(str: string, limit: number = 50): string {
    str = str.toString();
    if (str.length > limit) {
        return str.slice(0, limit - 4) + '...';
    }
    return str;
}

export function removeOne<T>(i: number, list: T[]) {
    return R.remove(i, 1, list);
}

export function dropOne<T>(pred: (val: T) => boolean, list: T[]) {
    const index = R.findIndex(pred, list);
    if (index < 0) {
        throw new Error('Could not find element to drop!');
    }
    return removeOne<T>(index, list);
}

export const upper = R.map(R.toUpper);

export function findByProp<T, K>(prop: (e: T) => K, eq: K, list: T[]): T {
    return R.find((elem) => prop(elem) === eq, list);
}

interface Named {
    name: string;
}

export function findByName<T extends Named>(eq: string, list: Array<T>) {
    return R.find((elem) => elem.name.toUpperCase() === eq.toUpperCase(), list);
}

export interface OperationMap<T> {
    [index: string]: T;
}

interface OperationResult<T> {
    opname?: string;
    func?: T;
}

export function findObjOperation<T>(ops: OperationMap<T>, expr: any): OperationResult<T> {
    const result = R.find(([opname, exec]: [string, any]) => {
        return expr[opname];
    }, R.toPairs(ops));

    if (!result) {
        return {};
    }

    const opname = result[0];
    const func = result[1];
    return { opname, func };
}

