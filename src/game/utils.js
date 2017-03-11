
import * as R from 'ramda';

export function randomChoice(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

export function isString(val) {
    return typeof val === 'string';
}

export function isObject(val) {
    return val !== null && typeof val === 'object';
}

export function isArray(val) {
    return typeof val === 'object' && val.length;
}

export function ensureArray(val) {
    return isArray(val) ? val : [val];
}

export function trunc(str, limit = 50) {
    str = str.toString();
    if (str.length > limit) {
        return str.slice(0, limit - 4) + '...';
    }
    return str;
}

export const removeOne = R.remove(R.__, 1);

export function dropOne(pred, list) {
    const index = R.findIndex(pred, list);
    if (index < 0) {
        throw new Error('Could not find element to drop!');
    }
    return removeOne(index, list);
}

export const upper = R.map(R.toUpper);

export function findByProp(prop, eq, list) {
	return R.find((elem) => prop(elem) === eq, list);
}

export function findByName(eq, list) {
    return R.find((elem) => elem.name.toUpperCase() === eq.toUpperCase(), list);
}

export function findObjOperation(ops, expr) {
    const result = R.find(([opname, exec]) => {
        return expr[opname];
    }, R.toPairs(ops));

    if (!result) {
        return {};
    }

    const opname = result[0];
    const func = result[1];
    return { opname, func };
}

