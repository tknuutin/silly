
import * as Bacon from 'baconjs';
import $ from './jqueryp';
import * as BJQ from 'bacon.jquery';
import { createView } from './view';
import * as R from 'ramda';
import { getById, getStartData } from './network'
import { handleCommand } from './game'

const updateState = (initialState) => {
    // Sort of a mutable state hack
    let currentState = initialState;
    return (cmd) => {
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
    const matching = R.filter(({ cmd }) => cmd.indexOf(testCmd) === 0);

    return R.map(R.prop('cmd'), matching(cmds));
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

