
import * as Bacon from 'baconjs';
import $ from './jqueryp';
import * as BJQ from 'bacon.jquery';
import { createView } from './view';
import * as R from 'ramda';
import { getStartData } from './network'
import { handleCommand } from './game'

const updateState = (initialState, world) => {
    // Sort of a mutable state hack
    let currentState = initialState;
    return (cmd) => {
        return Bacon.fromPromise(
            handleCommand(currentState, world, cmd).then(newState => {
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
    const matching = R.filter(({ cmd }) => cmd.indexOf(testCmd) === 0);

    return R.map(R.prop('cmd'), matching(cmds));
}



function startGame(initialState, world, view) {
    const input = view.commands;
    const areaCmds = (state) => world.areas[state.currentArea].commands;

    const stateS = Bacon.once()
        .merge(input.changes())
        .flatMapConcat(updateState(initialState, world));
    const stateP = stateS.toProperty();

    stateP.onValue((state) => {
        R.forEach(view.print, state.output);
        view.onCommand();
    });

    const gameInitialized = stateP.map((state) => state.game.initialized);

    const areaCommands = stateS.map(areaCmds)
        .filter(gameInitialized).toProperty();

    const validInputP = view.validInput.toProperty();
    const matchingCommands = areaCommands
        .sampledBy(validInputP, getMatchingCommands);

    const suggestions = view.validInput.map(matchingCommands);
    suggestions.onValue(view.showSuggestions);
    view.invalidInput.onValue(() => view.showSuggestions(null));
}



function start() {
    getStartData().onValue(({ state, world }) => {
        startGame(state, world, createView());
    });
}

window.onload = start;

