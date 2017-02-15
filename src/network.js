
import * as Bacon from 'baconjs';
import * as R from 'ramda';

// This is all mocked because we don't have a server yet

const BEDROOM_COMMANDS = [
    {
        trigger: 'look at room',
        usable: 1,
        events: {
            desc: "You look out of your window. It's a grey, boring autumn day in the street below.",
        }
    },
    {
        trigger: 'open door',
        events: [
            {
                desc: "You open the door. The smell from the kitchen hits you in the face.",
                set: ['global:has_opened_bedroom_door', 1]
            }
        ]
    },
    {
        trigger: 'go to kitchen',
        available: { exists: ['global:has_opened_bedroom_door']},
        events: [{
            desc: '',
            move: 'area:core:kitchen'
        }]
    },
];



const AREAS = {
    'area:core:bedroom': {
        refs: ['core:area:kitchen'],
        id: 'area:core:bedroom',
        name: 'Bedroom',
        desc: ["It's your bedroom."],
        firstDesc: ['You are in your bedroom. There is a window, a bed, and a door. What do you do?'],
        commands: BEDROOM_COMMANDS
    },
    'area:core:kitchen': {
        refs: ['core:area:kitchen'],
        id: 'area:core:bedroom',
        name: 'Kitchen',
        desc: ["It's your bedroom."],
        firstDesc: ['You are in your kitchen.'],
        commands: [{
            trigger: 'go to bedroom',
            events: {
                move: 'area:core:bedroom'
            }
        }],  
    }
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
        items: [],
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
    currentArea: AREAS['area:core:bedroom'],
    areas: {},
    output: ['Starting game!']
}

const IDS = R.merge({
    'start': { state: STARTSTATE, world: { 'area:core:bedroom': AREAS['area:core:bedroom'] } },
}, AREAS);

function request(value) {
    return new Promise((res) => {
        setTimeout(() => {
            res(value);
        }, 300);
    });
}

export function getByIds(ids) {
    const data = R.pickAll(ids, IDS);
    if (!R.all(Object.values(data))) {
        throw new Error('could not find ids!');
    }

    return Promise.resolve(data);
}


