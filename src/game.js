

import * as R from 'ramda';
import { applyTemplate } from './template';
import { get, getAreaData } from './world';

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

const areasL = R.lensProp('areas');

function askName() {
    return START_Q;
}

function printName(state) {
    const insult = randomChoice(NAME_INSULTS);
    return [`Your name is ${state.player.name}. ${insult}`];
}

function enterArea(area, state, output) {
    return getAreaData(area).then(() => {
        const { areas, currentArea } = state;
        if (!areas[currentArea.id]) {
            const desc = applyTemplate(currentArea.firstDesc, state);
            return { state: R.set(areasL, area, state), output: output.concat(desc) };
        }

        return { state, output };    
    });
};

function gameStep(state, output) {
    const { currentArea, lastArea, areas } = state;
    if (!currentArea.id !== lastArea) {
        return enterArea(currentArea, state, output);
    }

    return Promise.resolve({ state, output });
}

function makeState(old, input) {
    return {
        game: R.clone(old.game),
        player: R.clone(old.player),
        lastArea: R.clone(old.lastArea),
        currentArea: R.clone(old.currentArea),
        areas: R.clone(old.areas),
        id: Math.random(),
        lastInput: input,
        cmds: old.cmds + 1
    };
}

export function nextState(oldState, input = '') {
    
    let state = makeState(oldState, input);
    let output = [];

    if (!state.game.askedName) {
        state.game.askedName = true;
        return Promise.resolve({ state, output: askName() });
    } else if (!state.game.initialized) {
        state.player.name = input;
        state.game.initialized = true;
        output = output.concat(printName(state));
    }

    return gameStep(state, output);
}
