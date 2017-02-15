
import * as Bacon from 'baconjs';
import * as R from 'ramda';

import { createView } from './views/view';
import { get, getStartState } from './game/world';
import { nextState } from './game/game';

const updateState = (initialState) => {
    // Sort of a mutable state hack
    let currentState = initialState;

    const setState = (state) => {
        currentState = state;
        window._state = state;  // For debug

    }

    window._stateToJson = () => JSON.stringify(currentState);

    return (cmd) => {
        return Bacon.fromPromise(
            nextState(currentState, cmd).then((state) => {
                setState(state);
                return state;
            })
        );
    };
}

const trigger = R.prop('trigger');

function getMatchingCommands(cmds, inputCmd) {
    if (!inputCmd || inputCmd.length < 2) {
        return [];
    }

    const testCmd = inputCmd.length === 2 ? inputCmd + ' ' : inputCmd;
    const matching = R.filter(({ trigger }) => trigger.indexOf(testCmd) === 0);

    return R.map(trigger, matching(cmds));
}

function initSuggestions(view, stateS) {
    const gameInitialized = stateS
        .toProperty()
        .map((state) => state.game.initialized);

    // FIX THIS TO ACCOUNT FOR NEW WAY OF GETTING SUGGESTIONS

    const areaCommands = stateS
        .filter(gameInitialized)
        .map((state) => state.suggestions.areaCmds)
        .toProperty();

    const validInputP = view.validInput.toProperty();
    const matchingCommands = areaCommands
        .sampledBy(validInputP, getMatchingCommands);

    const suggestions = view.validInput.map(matchingCommands);
    suggestions.onValue(view.showSuggestions);

    view.invalidInput.onValue(() => view.showSuggestions(null));
    
    suggestions.toProperty().sampledBy(view.tabs).onValue((sugg) => {
        view.setValue(sugg[0]);
    });
}

function initStateHandling(initialState, view) {
    const input = view.commands;

    const stateS = Bacon.once()
        .merge(input.changes())
        .flatMapConcat(updateState(initialState));
    stateS.onError((e) => {
        console.error(e);
        view.showError(e);
    });
    const stateP = stateS.toProperty();

    stateP.onValue((state) => {
        R.forEach(view.print, state.output);
        view.onCommand();
    });

    return stateS;
}

function getAreaCommands(stateS) {
    const areaCmds = (state) => state.currentArea.commands;
    const gameInitialized = stateS
        .toProperty()
        .map((state) => state.game.initialized);

    const areaCommands = stateS.map(areaCmds)
        .filter(gameInitialized).toProperty();
    return areaCommands;
}

function start() {
    getStartState().then((state) => {
        const view = createView();
        const stateS = initStateHandling(state, view);
        const areaCommands = getAreaCommands(stateS)
        const suggestions= initSuggestions(view, stateS);
    });
}

window.onload = start;

