

import * as R from 'ramda';
import { replaceWithState } from './template';
import { get } from './world';

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

    const rawText = (text) => output.push(text);
    const templText = (text, pushTo) => 
        replaceWithState(text, state).then((text) => pushTo.push(text));

    if (input) {
        rawText('> ' + input);
    }

    if (oldState.cmds === 0) {
        R.forEach((l) => rawText(l), START_Q);
    } else if (!state.game.initialized || state.cmds === 1) {
        state.player.name = input;
        state.game.initialized = true;
        const insult = randomChoice(NAME_INSULTS);
        rawText(`Your name is ${state.player.name}. ${insult}`);
    }

    if (state.game.initialized) {
        const { currentArea, areas } = state;
        if (!areas[currentArea.id]) {
            return templText(currentArea.firstDesc, output).then(() => {
                areas[currentArea] = {};
                return state;
            });
        }
    }

    return Promise.resolve(state);

    // return new Promise((res) => {
    //     setTimeout(() => {
    //         res(state);
    //     }, 200);
    // });
}
