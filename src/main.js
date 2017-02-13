
import * as Bacon from 'baconjs';
import $ from './jqueryp';
import * as BJQ from 'bacon.jquery';
import { createView } from './view';
import * as R from 'ramda';
import { get, getStartState } from './world';
import { nextState } from './game';

const updateState = (initialState) => {
    // Sort of a mutable state hack
    let currentState = initialState;
    return (cmd) => {
        return Bacon.fromPromise(
            nextState(currentState, cmd).then(({ state, output }) => {
                currentState = state;
                return { state, output };
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

function initSuggestions(view, areaCommands) {
    const validInputP = view.validInput.toProperty();
    const matchingCommands = areaCommands
        .sampledBy(validInputP, getMatchingCommands);

    const suggestions = view.validInput.map(matchingCommands);
    suggestions.onValue(view.showSuggestions);
    view.invalidInput.onValue(() => view.showSuggestions(null));
}

function initStateHandling(initialState, view) {
    const input = view.commands;

    input.onValue((cmd) => view.print('> ' + cmd))

    const stateS = Bacon.once()
        .merge(input.changes())
        .flatMapConcat(updateState(initialState));
    const stateP = stateS.toProperty();

    stateP.onValue(({ state, output }) => {
        R.forEach(view.print, output);
        view.onCommand();
    });

    return stateS;
}

function getAreaCommands(stateS) {
    const areaCmds = ({ state }) => state.currentArea.commands;
    const gameInitialized = stateS
        .toProperty()
        .map(({ state }) => state.game.initialized);

    const areaCommands = stateS.map(areaCmds)
        .filter(gameInitialized).toProperty();
    return areaCommands;
}

function start() {
    getStartState().then((state) => {
        const view = createView();
        const stateS = initStateHandling(state, view);
        const areaCommands = getAreaCommands(stateS)
        initSuggestions(view, areaCommands);
    });
}

window.onload = start;

