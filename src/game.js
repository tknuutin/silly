

import * as R from 'ramda';
import { applyTemplate } from './template';
import { get, getAreaData } from './world';
import * as Text from './text';
import * as Logic from './logic';
import * as GEvent from './gevent'

const l = {
    areas: R.lensProp('areas'),
    currentArea: R.lensProp('currentArea'),
};

const pr = {
    cancel: R.prop('cancel')
}


function print(state, text) {
    state.output.push(text);
    return state;
}


function firstVisitOnArea(area, state) {
    const desc = applyTemplate(area.firstDesc, state);
    print(state, desc);
    return R.set(l.areas, R.set(R.lensProp(area.id), {}, state.areas), state);
}

function enterArea(areaId, state) {
    return fetchAreaData(areaId).then(() => {
        state.lastArea = state.currentArea.id;
        state.currentArea = get(areaId);

        const { areas, currentArea } = state;

        if (!areas[currentArea.id]) {
            return firstVisitOnArea(currentArea, state);
        }

        return state;    
    });
};

function isCommandAvailable(command, currentArea, state) {
    const areaInfo = state.areas[currentArea.id] || {};
    const usedCmds = areaInfo.cmds || {};
    const { trigger, available, usable } = command;
    const history = usedCmds[trigger];
    return (
        (!history || usable === undefined || usable > history.used) &&
        Logic.isTrue(state, available)
    );
}

function getAvailableCommands(state, area) {
    return R.filter(
        (command) => isCommandAvailable(command, area, state),
        area.commands
    );
}

function getCommand(state, area, inputCmd) {
    const availables = getAvailableCommands(state, area);
    return R.find(({ trigger }) => trigger === inputCmd, availables);
}

function getdef(obj, prop, val) {
    const newval = obj[prop] === undefined ? val : obj[prop];
    return R.set(R.lensProp(prop), newval, obj);
}

function useCommand(command, currentArea, state) {
    const area = getdef(state.areas, currentArea.id, {});
    const cmds = getdef(area, 'cmds', {});
    const cmdDef = getdef(cmds, command, {});
    cmdDef.used = (cmdDef.used || 0) + 1;
    return R.set(
        l.areas,
        R.set(R.lensProp(currentArea.id), area, state.areas),
        state
    );
}

function moveTime(time, state) {
    state.time += time || 5;
    return { state, interrupts: [], deferred: [] };
}

function handleEvent(event, state) {
    const timeMoveResult = moveTime(event.time, state);
    state = timeMoveResult.state;
    const { interrupts, deferred } = timeMoveResult;
    const shouldCancel = R.any(R.identity, R.map((i) => i.cancel, interrupts));

    const applyEvents = R.reduce((state, evt) => GEvent.execEvent(evt, state));

    state = applyEvents(state, interrupts);

    if (shouldCancel) {
        return { state, move: null };
    }

    if (event.move) {
        return { state, move: event.move };
    }
    
    state = GEvent.execEvent(event, state);
    state = applyEvents(state, deferred);

    return { state, move: null };
}

function handleCommandFromPlayer(state, inputCmd) {
    const { currentArea, lastArea, areas } = state;

    const command = getCommand(state, currentArea, inputCmd);
    if (command) {
        state = useCommand(command, currentArea, state);
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
        state = print(state, Text.unknownCommand())
    }

    return Promise.resolve(state);
}

function makeState(old, inputCmd) {
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
        suggestions: { areaCmds: [] },
        output: []
    };
}

function getSuggestions(state) {
    state.suggestions = {
        areaCmds: getAvailableCommands(state, state.currentArea)
    };
    return state;
}

export function nextState(oldState, inputCmd = '') {
    let state = makeState(oldState, inputCmd);

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
