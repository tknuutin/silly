
import * as Bacon from 'baconjs';
import $ from './jqueryp';
import * as BJQ from 'bacon.jquery';
import { createView } from './view';
import * as R from 'ramda';
import * as Network from './network'

function getGameState(state) {
    return R.clone(state);
}

function getPlayerState(state) {
    return R.clone(state);
}

function getCurrentArea(area) {
    return area;
}

function getAreasData(state) {
    return R.clone(state);
}

function handleCommand(state, input = '') {
    const id = Math.random();
    const newState = {
        game: getGameState(state.game),
        player: getPlayerState(state.player),
        currentArea: getCurrentArea(state.currentArea),
        areas: getAreasData(state.areas),
        output: ['> ' + input],
        id: Math.random(),
        lastInput: input,
        cmds: state.cmds + 1
    };

    return new Promise((res) => {
        setTimeout(() => {
            res(newState);
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

const areaCmds = (state) => Network.getById(state.currentArea).commands;

function startGame(initialState, view) {
    const input = view.commands;

    const stateS = Bacon.once()
        .merge(input.changes())
        .flatMapConcat(updateState(initialState));
    const stateP = stateS.toProperty();

    stateP.onValue((state) => {
        // console.log('value', JSON.stringify(state));
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
    Network.getStartData().onValue((data) => {
        startGame(data, createView());
    });
}

window.onload = start;

