
import { getByIds } from './network';
import * as R from 'ramda';


let cache = {};

function saveToCache(ids) {
    cache = R.merge(cache, ids);
}

export function get(id) {
    if (cache[id]) {
        return Promise.resolve(cache[id]);
    }

    return getAndCache([id]);
}

function getAndCache(ids) {
    return getByIds(ids)
        .then((data) => {
            saveToCache(data);
            return data;
        });
}

export function getAreaData(area) {
    return getAndCache([area.refs]);
}

export function getStartState() {
    return getByIds(['start'])
        .then((resp) => {
            const { state, world } = resp.start;
            saveToCache(world);
            return state;
        });
}