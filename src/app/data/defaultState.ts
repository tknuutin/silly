
import { State } from './state';
import { InternalArea } from '../itypes/iarea';

export const STARTSTATE: State = {
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
