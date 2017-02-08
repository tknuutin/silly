
import * as Bacon from 'baconjs';

// This is all mocked because we don't have a server yet

const BEDROOM_COMMANDS = [
    {
        cmd: 'look at room',
        outcomes: {
            desc: "You look out of your window. It's a grey, boring autumn day in the street below.",
        }
    },
    {
        cmd: 'open door',
        outcomes: {
            desc: "You open the door. The smell from the kitchen hits you in the face.",
            globalVars: [
                {
                    name: 'has_opened_bedroom_door',
                    set: 1
                }
            ]
        }
    },
    {
        cmd: 'go to kitchen',
        available: [
            {
                globalVars: {
                    exists: 'has_opened_bedroom_door'
                }
            }
        ],
        outcomes: {
            desc: '',
            move: 'Kitchen'
        }
    },
];

const STARTSTATE = {
    id: 0,
    lastInput: '',
    cmds: 0,
    game: {
        initialized: false,
    },
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
    currentArea: 'core:bedroom',
    areas: {},
    output: ['Starting game!']
}

const AREAS = {
    'core:bedroom': {
        name: 'Bedroom',
        desc: "It's your bedroom.",
        firstDesc: 'You are in your bedroom. There is a window, a bed, and a door. What do you do?',
        commands: BEDROOM_COMMANDS  
    }
}

function mockRequest(value) {
    return Bacon.fromCallback((callback) => {
        setTimeout(() => {
            callback(value);
        }, 300);
    });
}

export function getById(id) {
    // Mocking this like this for now, i dont currrr
    const area = AREAS[id];
    if (area) {
        return area;
    }
    throw new Error('uh oh');
}

export function getStartData() {
    return mockRequest(STARTSTATE);
}


