
import { getByIds } from '../api/network';
import * as R from 'ramda';
import { isString } from './utils'; 

import { Area } from '../types/area';
import { State } from './state';

let cache = {};

function saveToCache(ids: any) {
    cache = R.merge(cache, ids);
}

(window as any)._worldToJson = () => JSON.stringify(cache);

export function get(id: string) {
    if (!cache[id]) {
        throw new Error('Could not find resource: ' + id);
    }

    return R.clone(cache[id]);
}

function getAndCache(ids: string[]) {
    return getByIds(ids)
        .then((data) => {
            saveToCache(data);
            return data;
        });
}

const getRefs = R.map(R.prop('ref'));

export function fetchAreaData(areaId: string) {
    return getAndCache([areaId]).then((data) => {
        const area = data[areaId];
        const refs = area.refs
            .concat(getRefs(area.items || []))
            .concat(getRefs(area.monsters || []));
        return getAndCache(refs).then(() => {
            return area;
        });
    });
}

const STARTSTATE: State = {
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
                ref: 'core:item:player-mouth',
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
    suggestions: {
        areaCmds: [], builtins: []
    },
    currentArea: (undefined as any as Area), // set later
    areas: {},
    output: ['Starting game!']
};

const DEBUGSTATE = null;
const DEBUGWORLD = null;

export function getStartState() {
    const startAreaId = 'core:area:bedroom';
    return fetchAreaData(startAreaId)
        .then((area: Area) => {
            const state = R.clone(DEBUGSTATE || STARTSTATE);
            state.currentArea = area;

            if (DEBUGWORLD) {
                saveToCache(DEBUGWORLD);    
            }
            
            return state;
        });
}
