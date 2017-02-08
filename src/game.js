

import * as R from 'ramda';


import { getById } from './network'

const START_Q = [
    "You feel dizzy, like you've just woken up from a heavy nap. You can't quite remember your name.",
    "By enormous strain the gears in your meatpan start turning. Yes, your name is..."
];

const NAME_INSULTS = [
	"Really? I guess that's what we're working with.",
	"Okay, let's go with that for now.",
	"That can't be correct.",
	"A rather stupid name, but that's the one you chose. No point berating yourself about it a second after you come up with it.",
	"You feel a powerful affinity with this newly chosen name.",
	"That sure is your name, as God is my witness."
];

export function handleCommand(oldState, input = '') {
    const id = Math.random();

    const output = [];
    const state = {
        game: R.clone(oldState.game),
        player: R.clone(oldState.player),
        currentArea: R.clone(oldState.currentArea),
        areas: R.clone(oldState.areas),
        output: output,
        id: Math.random(),
        lastInput: input,
        cmds: oldState.cmds + 1
    };

    if (input) {
        output.push('> ' + input);
    }

    if (oldState.cmds === 0) {
        R.forEach((l) => output.push(l), START_Q);
    } else if (!state.game.initialized || state.cmds === 1) {
        state.player.name = input;
        state.game.initialized = true;
        const insult = NAME_INSULTS[Math.floor(Math.random() * NAME_INSULTS.length)];
        output.push(`You name is ${state.player.name}. ${insult}`);
    }

    if (state.game.initialized) {
        const { currentArea, areas } = state;
        const area = getById(currentArea);
        if (!areas[currentArea]) {
            output.push(area.firstDesc);
            areas[currentArea] = {};
        }
    }

    return new Promise((res) => {
        setTimeout(() => {
            res(state);
        }, 200);
    });
}
