
import { getByIds } from './network';
import * as R from 'ramda';


let cache = {};

function saveToCache(ids) {
    cache = R.merge(cache, ids);
}

export function get(id) {
    if (!cache[id]) {
        throw new Error('Could not find resource: ' + id);
    }

    return cache[id];
}

function getAndCache(ids) {
    return getByIds(ids)
        .then((data) => {
            saveToCache(data);
            return data;
        });
}

export function fetchAreaData(areaId) {
    return getAndCache(areaId).then((area) => {
        return getAndCache(area.refs).then(() => {
            return area;
        });
    });
}

export function getStartState() {
    return getByIds(['start'])
        .then((resp) => {
            const { state, world } = resp.start;
            saveToCache(world);
            return state;
        });
}