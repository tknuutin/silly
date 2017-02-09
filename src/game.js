

import * as R from 'ramda';
import { replaceWithState } from './template';

const START_Q = [
    "You feel dizzy, like you've just woken up from a heavy nap. You can't quite remember your name.",
    "By enormous strain the gears in your meatpan start turning. Yes, your name is..."
];

const NAME_INSULTS = [
    "Really? I guess that's what we're working with.",
    "Uhh, let's come back to that later.",
    "That can't be correct, but let's go with that for now.",
    "A rather stupid name, but that's the one you chose. No point berating yourself about it a second after you come up with it.",
    "You feel a powerful affinity with this newly chosen name.",
    "That sure is your name, as God is my witness."
];


const randomChoice = (arr) => arr[Math.floor(Math.random() * arr.length)];
const areaByName = (world) => (id) => world.areas[id];

export function handleCommand(oldState, world, input = '') {
    const id = Math.random();
    const getArea = areaByName(world);

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

    const pushText = (text) => output.push(replaceWithState(text, state, world)); 

    if (input) {
        pushText('> ' + input);
    }

    if (oldState.cmds === 0) {
        R.forEach((l) => pushText(l), START_Q);
    } else if (!state.game.initialized || state.cmds === 1) {
        state.player.name = input;
        state.game.initialized = true;
        const insult = randomChoice(NAME_INSULTS);
        pushText(`Your name is ${state.player.name}. ${insult}`);
    }

    if (state.game.initialized) {
        const { currentArea, areas } = state;
        const area = getArea(currentArea);
        if (!areas[currentArea]) {
            pushText(area.firstDesc);
            areas[currentArea] = {};
        }
    }

    return new Promise((res) => {
        setTimeout(() => {
            res(state);
        }, 200);
    });
}
