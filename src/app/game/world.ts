
import { getByIds } from '../api/network';
import * as R from 'ramda';
import { isString } from './utils'; 

import { Area } from '../types/area';
import { State } from './state';
import { InternalArea } from './itypes/iarea';
import { convertArea } from './converters/area';

let cache = {};

function saveToCache(ids: any) {
    cache = R.merge(cache, ids);
}

(window as any)._worldToJson = () => JSON.stringify(cache);

export function get<T>(id: string): T {
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

const getRefs = R.map(R.prop('ref')) as (a: { ref: string }[]) => string[];

export function fetchAreaData(areaId: string): Promise<InternalArea> {
    return getAndCache([areaId]).then((data) => {
        const area = data[areaId] as Area;
        const refs = area.refs
            .concat(getRefs(area.items || []))
            .concat(getRefs(area.actors || []));
        return getAndCache(refs).then(() => {
            return convertArea(area);
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
    currentArea: (undefined as any as InternalArea), // set later
    areas: {},
    output: ['Starting game!']
};

/* tslint:disable whitespace */
// Paste in the debug state here and the world below
// const DEBUGSTATE = null;
// const DEBUGWORLD = null;

const DEBUGSTATE: any = {"game":{"askedName":true,"initialized":true},"player":{"name":"harold","health":100,"items":[{"ref":"core:item:player-mouth","equipped":true}],"vars":[],"stats":{"brawn":10,"gait":10,"allure":10,"mind":10,"grit":10,"luck":10}},"lastArea":null,"currentArea":{"refs":["core:item:bedroom-bed","core:item:bedroom-paper","core:item:player-mouth"],"id":"core:area:bedroom","tags":["room","home"],"name":"Bedroom","desc":["It's your bedroom."],"firstDesc":{"text":["You are in your bedroom. There is a WINDOW, a BED, and a DOOR. What do you do?"],"noSeparateDesc":["core:item:bedroom-bed"]},"commands":[{"trigger":"look at room","alias":["examine window","look out of window"],"invisibleAlias":["peep at window"],"events":{"desc":"You look out of your window. It's a grey, boring autumn day in the street below."}},{"trigger":"open door","usable":1,"events":{"desc":"You open the door. The smell from the kitchen hits you in the face.","math":[{"set":["global:has_opened_bedroom_door",1]}]},"visible":{"gt":["global:has_tried_to_open_bedroom_door",0]}},{"trigger":"spawn monster","usable":1,"events":{"spawn":{"actor":{"ref":"none"}}},"visible":{"gt":["global:has_tried_to_open_bedroom_door",0]}},{"trigger":"go to kitchen","events":[[{"or":[{"lt":["global:has_opened_bedroom_door",1]},{"not":{"exists":"global:has_opened_bedroom_door"}}]},{"desc":"The door is still closed!","set":["global:has_tried_to_open_bedroom_door",1]}],[null,{"desc":"With the way to the fertile lands of the kitchen now open, you step through the passage.","move":"core:area:kitchen"}]]}],"items":[{"ref":"core:item:bedroom-bed"},{"ref":"core:item:bedroom-paper"}],"actors":[]},"areas":{"core:area:bedroom":{"cmds":{"open door":{"used":1}}}},"vars":{"has_opened_bedroom_door":1},"id":0.4451354116468338,"lastInput":"open door","time":5,"cmds":2,"suggestions":{"builtins":[{"trigger":"examine"},{"trigger":"look at"}],"areaCmds":[{"trigger":"look at room","alias":["examine window","look out of window"],"invisibleAlias":["peep at window"],"events":{"desc":"You look out of your window. It's a grey, boring autumn day in the street below."}},{"trigger":"go to kitchen","events":[[{"or":[{"lt":["global:has_opened_bedroom_door",1]},{"not":{"exists":"global:has_opened_bedroom_door"}}]},{"desc":"The door is still closed!","set":["global:has_tried_to_open_bedroom_door",1]}],[null,{"desc":"With the way to the fertile lands of the kitchen now open, you step through the passage.","move":"core:area:kitchen"}]]}]},"output":["You open the door. The smell from the kitchen hits you in the face."]};
const DEBUGWORLD = {"core:area:bedroom":{"refs":["core:item:bedroom-bed","core:item:bedroom-paper","core:item:player-mouth"],"id":"core:area:bedroom","tags":["room","home"],"name":"Bedroom","desc":["It's your bedroom."],"firstDesc":{"text":["You are in your bedroom. There is a WINDOW, a BED, and a DOOR. What do you do?"],"noSeparateDesc":["core:item:bedroom-bed"]},"commands":[{"trigger":"look at room","alias":["examine window","look out of window"],"invisibleAlias":["peep at window"],"events":{"desc":"You look out of your window. It's a grey, boring autumn day in the street below."}},{"trigger":"open door","usable":1,"events":{"desc":"You open the door. The smell from the kitchen hits you in the face.","math":[{"set":["global:has_opened_bedroom_door",1]}]},"visible":{"gt":["global:has_tried_to_open_bedroom_door",0]}},{"trigger":"spawn monster","usable":1,"events":{"spawn":{"actor":{"ref":"none"}}},"visible":{"gt":["global:has_tried_to_open_bedroom_door",0]}},{"trigger":"go to kitchen","events":[[{"or":[{"lt":["global:has_opened_bedroom_door",1]},{"not":{"exists":"global:has_opened_bedroom_door"}}]},{"desc":"The door is still closed!","set":["global:has_tried_to_open_bedroom_door",1]}],[null,{"desc":"With the way to the fertile lands of the kitchen now open, you step through the passage.","move":"core:area:kitchen"}]]}],"items":[{"ref":"core:item:bedroom-bed"},{"ref":"core:item:bedroom-paper"}]},"core:item:bedroom-bed":{"id":"core:item:bedroom-bed","name":"Bed","desc":"It is a filthy bed. The sheets are one size too small for the frame."},"core:item:bedroom-paper":{"id":"core:item:bedroom-paper","name":"Piece of paper","desc":"It is a small piece of paper lying on the floor. There is some text on it.","carry":{"onPickupDesc":"You take the piece of paper. The text on it says: '45322,--> bleh bleh unf unf'. There is also a small drawing of a phallus.","carryDesc":"It's the piece of paper you picked up from your bedroom with the dumb meaningless text and penis drawing.","droppedDesc":"It's the piece of paper you picked up from your bedroom with the dumb meaningless text and penis drawing."}},"core:item:player-mouth":{"id":"core:item:player-mouth","name":"Powerful mouth","desc":"It's your mouth!","carry":{"droppable":false,"carryDesc":"Your teeth glisten with barely controlled fury..."}}};
/* tslint:enable whitespace */

export function getStartState() {
    const startAreaId = 'core:area:bedroom';
    return fetchAreaData(startAreaId)
        .then((area: InternalArea) => {
            const state = R.clone(DEBUGSTATE || STARTSTATE);
            state.currentArea = area;

            if (DEBUGWORLD) {
                saveToCache(DEBUGWORLD);    
            }
            
            return state;
        });
}
