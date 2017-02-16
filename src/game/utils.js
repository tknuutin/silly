
import * as R from 'ramda';

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

export const upper = R.map(R.toUpper);

