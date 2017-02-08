
import * as Bacon from 'baconjs';
import $ from './jqueryp';
import * as BJQ from 'bacon.jquery';
import { createView } from './view';
import * as R from 'ramda';
import { getById, getStartData } from './network'

const START_Q = [
    "You feel dizzy, like you've just woken up from a heavy nap. You can't quite remember your name.",
    "What is your name?"
]

function handleCommand(oldState, input = '') {
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
        output.push(`You name is ${state.player.name}.`);
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

const updateState = (initialState) => {
    let currentState = initialState;
    return (cmd) => {
        console.log('in update state', cmd);
        return Bacon.fromPromise(
            handleCommand(currentState, cmd).then(newState => {
                currentState = newState;
                return newState;
            })
        );
    };
}

function getMatchingCommands(cmds, inputCmd) {
    if (!inputCmd || inputCmd.length < 2) {
        return [];
    }

    const testCmd = inputCmd.length === 2 ? inputCmd + ' ' : inputCmd;
    const filtered = R.filter(({ cmd }) => {
        return cmd.indexOf(testCmd) === 0;
    }, cmds);

    return R.map(R.prop('cmd'), filtered);
}

const areaCmds = (state) => getById(state.currentArea).commands;

function startGame(initialState, view) {
    const input = view.commands;

    const stateS = Bacon.once()
        .merge(input.changes())
        .flatMapConcat(updateState(initialState));
    const stateP = stateS.toProperty();

    stateP.onValue((state) => {
        R.forEach(view.print, state.output);
    });

    const areaCommands = stateS.map(areaCmds).toProperty()
    const validInputP = view.validInput.toProperty();
    const matchingCommands = areaCommands
        .sampledBy(validInputP, getMatchingCommands);

    const suggestions = view.validInput.map(matchingCommands);
    suggestions.onValue(view.showSuggestions);
    view.invalidInput.onValue(() => view.showSuggestions(null));
}



function start() {
    getStartData().onValue((data) => {
        startGame(data, createView());
    });
}

window.onload = start;

