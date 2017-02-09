
import { getById } from './network';
import * as R from 'ramda';


let cache = {};

function saveToCache(ids) {
    cache = R.merge(cache, ids);
}

export function get(id) {
    if (cache[id]) {
        return Promise.resolve(cache[id]);
    }

    return getById(id);
}

export function getStartState() {
    return getById('start')
        .then(({ state, world }) => {
            saveToCache(world);
            return state;
        });
}