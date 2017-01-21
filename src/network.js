
import * as Bacon from 'baconjs';

// This is all mocked because we don't have a server yet

const START_COMMANDS = [
    {
        cmd: 'look at room',
        outcome: {
            desc: "You look out of your window. It's a grey, boring autumn day in the street below.",
        }
    },
    {
        cmd: 'open door',
        outcome: {
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
        conditions: [
            {
                globalVars: {
                    exists: 'has_opened_bedroom_door'
                }
            }
        ],
        outcome: {
            desc: '',
            move: 'Kitchen'
        }
    },
];

const START = {
    game: {
        initializing: true,
    },
    player: {
        name: '',
        health: 100,
        items: [],
        vars: [],
        stats: {
            brawn: 5,    // strength
            gait: 5,     // speed
            allure: 5,   // charisma
            mind: 5,     // intelligence
            grit: 5,     // stamina
            luck: 5      // yep
        }
    },
    area: {
        name: 'Bedroom',
        desc: "It's your bedroom.",
        firstDesc: 'You are in your bedroom. There is a window, a bed, and a door. What do you do?',
        commands: START_COMMANDS
    }
}

function mockRequest(value) {
    return Bacon.fromCallback((callback) => {
        setTimeout(() => {
            callback(value);
        }, 300);
    });
}

export function getStartData() {
    return mockRequest(value);
}


