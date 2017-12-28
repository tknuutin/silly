

import * as R from 'ramda';
import { applyTemplate } from './template';
import { get, fetchAreaData } from './world';
import * as Text from './text';
import * as Logic from './logic';
import * as GEvent from './gevent';
import * as Command from './command';
// import * as Monster from './monster';
import { areaDesc } from './desc';
import { isString, isArray, trunc } from './utils';
import { State } from './state';

// I dunno
const l = {
    areas: R.lensProp('areas'),
    currentArea: R.lensProp('currentArea'),
};
const pr = {
    cancel: R.prop('cancel')
};


function print(state: State, text: string | string[]): State {
    text = isArray(text) ? text : [text];
    R.forEach((l) => state.output.push(l), text);
    return state;
}

function firstVisitOnArea(area: any, state: State) {
    const desc = areaDesc(state, area, area.firstDesc);
    print(state, desc);
    return R.set(l.areas, R.set(R.lensProp(area.id), {}, state.areas), state);
}

function enterArea(areaId: string, state: State) {
    return fetchAreaData(areaId).then(() => {
        if (!state.currentArea) {
            throw new Error('Aaaa!!!');
        }

        state.lastArea = state.currentArea.id;

        const newCurrentArea = get(areaId);
        state.currentArea = newCurrentArea;

        const { areas } = state;

        if (!areas[newCurrentArea.id]) {
            return firstVisitOnArea(newCurrentArea, state);
        } else {
            print(state, areaDesc(state, newCurrentArea, newCurrentArea.desc));
        }

        return state;    
    });
}

function moveTime(time: number, state: State): { state: any, interrupts: any[], deferred: any[] } {
    const moveAmount = time || 5;
    // to implement heh
    // const [interrupts, deferred] = Monster.moveTime(state, moveAmount);

    state.time += time || 5;
    return { state, interrupts: [], deferred: [] };
}

function handleEvent(event: any, inState: State) {
    const timeMoveResult = moveTime(event.time, inState);
    const { state, interrupts, deferred } = timeMoveResult;
    const shouldCancel = R.any((x: any) => !!x, R.map((i) => i.cancel, interrupts));

    const applyEvents = R.reduce((state: State, evt: any) => GEvent.execEvent(evt, state));

    const stateAppliedEvents = applyEvents(state, interrupts);

    if (shouldCancel) {
        return { state: stateAppliedEvents, move: null };
    }

    if (event.move) {
        return { state: stateAppliedEvents, move: event.move };
    }
    
    const stateExecEvents = GEvent.execEvent(event, state);

    // What is going on here
    const stateAppliedEventsAgain = applyEvents(stateExecEvents, deferred);

    return { state: stateAppliedEventsAgain, move: null };
}

function handleCommandFromPlayer(state: State, inputCmd: string) {
    const { currentArea, lastArea, areas } = state;

    const command = Command.getCommand(state, currentArea, inputCmd);
    if (command) {
        state = Command.registerCommandUsed(command, currentArea, state);
        const event = GEvent.getEvent(command.events, state);
        if (event) {
            const eventResult = handleEvent(event, state);
            state = eventResult.state;
            if (eventResult.move) {
                return enterArea(eventResult.move, state);
            }
        } else {
            throw new Error('No event found for command!');
        }
    } else {
        state = print(state, Text.unknownCommand());
    }

    return Promise.resolve(state);
}

function makeState(old: State, inputCmd: string): State {
    // I'm not too sure about what this is supposed to do anymore
    return {
        game: R.clone(old.game),
        player: R.clone(old.player),
        lastArea: R.clone(old.lastArea),
        currentArea: R.clone(old.currentArea),
        areas: R.clone(old.areas),
        vars: R.clone(old.vars),
        id: Math.random(),
        lastInput: inputCmd,
        time: old.time,
        cmds: old.cmds + 1,
        suggestions: { areaCmds: [], builtins: [] },
        output: []
    };
}

function getSuggestions(state: any) {
    const builtins = R.map((trigger) => ({ trigger }), ['examine', 'look at']);
    const areaCmds = R.filter(
        (command) => Command.isCommandVisible(state, command),
        Command.getAvailableAreaCommands(state, state.currentArea)
    );

    state.suggestions = {
        builtins, areaCmds
    };
    return state;
}

export function nextState(oldState: State, inputCmd: string = ''): Promise<State> {
    const state = makeState(oldState, inputCmd);

    if (!state.game.askedName) {
        state.game.askedName = true;
        print(state, Text.nameAsk());
        return Promise.resolve(state);
    } else if (!state.game.initialized) {
        state.player.name = inputCmd;
        state.game.initialized = true;

        print(state, Text.namePrint(state));

        const visited = firstVisitOnArea(state.currentArea, state);
        return Promise.resolve(visited).then(getSuggestions);
    }

    return handleCommandFromPlayer(state, inputCmd)
        .then(getSuggestions);
}
