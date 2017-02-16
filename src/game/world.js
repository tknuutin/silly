
import { getByIds } from '../api/network';
import * as R from 'ramda';
import { isString } from './utils'; 


let cache = {};

function saveToCache(ids) {
    cache = R.merge(cache, ids);
}

window._worldToJson = () => JSON.stringify(cache);

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
    return getAndCache([areaId]).then((data) => {
        const area = data[areaId];
        const refs = area.refs
            .concat(area.items || [])
            .concat(area.monsters || [])
        return getAndCache(refs).then(() => {
            return area;
        });
    });
}

const STARTSTATE = {
    id: 0,
    lastInput: '',
    lastArea: null,
    cmds: -1,
    game: {
        askedName: false,
        initialized: false,
    },
    time: 0,
    vars: {},
    player: {
        name: '',
        health: 100,
        items: [
            {
                id: 'core:item:player-mouth',
                equipped: true
            }
        ],
        vars: [],
        stats: {
            brawn: 10,    // strength
            gait: 10,     // speed
            allure: 10,   // charisma
            mind: 10,     // intelligence
            grit: 10,     // stamina
            luck: 10      // yep
        }
    },
    currentArea: null, // set later
    areas: {},
    output: ['Starting game!']
}

const DEBUGSTATE = null;
const DEBUGWORLD = null;

export function getStartState() {
    const startAreaId = 'core:area:bedroom';
    return fetchAreaData([startAreaId])
        .then((area) => {
            const state = R.clone(DEBUGSTATE || STARTSTATE);
            state.currentArea = area;
            // debugger;

            if (DEBUGWORLD) {
                saveToCache(DEBUGWORLD);    
            }
            
            return state;
        });
}