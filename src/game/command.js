
import * as R from 'ramda';
import * as Logic from './logic';
import { areaDesc, itemDesc, monsterDesc } from './desc';
import { findByName } from './utils';
import * as World from './world';

function makeInBuiltCommand(name, event) {
    return {
        trigger: name,
        inbuilt: true,
        events: event
    }
}

const getRefs = (list) => R.map(R.pipe(R.prop('ref'), World.get), list || []);
const currentAreaIsRoom = (area) => R.any(R.equals('room'), area.tags);
const makeEvent = (desc) => ({ desc });

const examine = (state, match, inputCmd) => {
    const target = match[1];
    const area = state.currentArea;
    
    if (!target) {
        return ["Examine what?"];
    }

    const targetIsRoom = target === 'room';
    if (targetIsRoom || target === 'area') {
        const desc = areaDesc(state, area, area.desc);
        if (!targetIsRoom || currentAreaIsRoom(area)) {
            return desc;
        } else {
            return ["This isn't really a room, but ok.", ""].concat(desc);
        }
    }

    debugger;

    const pname = R.prop('name');
    const playerItemMatch = findByName(target, getRefs(state.player.items));
    if (playerItemMatch) {
        const { id, equipped } = playerItemMatch;
        const item = World.get(id);
        return itemDesc(state, item, item.desc, equipped);
    }

    const itemMatch = findByName(target, getRefs(state.currentArea.items));
    if (itemMatch) {
        const item = World.get(itemMatch.id);
        return itemDesc(state, item, item.desc, false);
    }

    const monsterMatch = findByName(target, getRefs(state.currentArea.monsters));
    if (monsterMatch) {
        const monster = World.get(monsterMatch.id);
        return monsterDesc(state, monster, monster.desc, false);
    }

    return ["You don't see any of that around for your eager eyes to peep."];
}

const inBuilt = [
    {
        re: /^examine(?: (.*))?$/,
        createEvent: (state, match, inputCmd) => makeEvent(examine(state, match))
    }
]

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

export function getAvailableAreaCommands(state, area) {
    return R.filter(
        (command) => isCommandAvailable(command, area, state),
        area.commands
    );
}

function getInBuiltCommand(state, inputCmd) {
    // debugger;
    const inputChecked = R.map(({ createEvent, re }) =>
        ({ createEvent, match: re.exec(inputCmd) }), inBuilt);

    const matchedInBuilt = R.find(({ match }) => !!match, inputChecked);
    if (matchedInBuilt) {
        const evt = matchedInBuilt.createEvent(state, matchedInBuilt.match, inputCmd);
        return { global: true, events: [evt] };
    }
    return null;
}

function getAreaCommand(state, area, inputCmd) {
    const availables = getAvailableAreaCommands(state, area);
    return R.find(({ trigger }) => trigger === inputCmd, availables);
}

export function getCommand(state, area, inputCmd) {
    return (
        getAreaCommand(state, area, inputCmd) ||
        getInBuiltCommand(state, inputCmd)
    );
}

export function registerCommandUsed(command, currentArea, state) {
    if (command.global) {
        return state;
    }

    const { areas } = state;
    
    const area = areas[currentArea.id] ?
        R.clone(areas[currentArea.id]) :
        R.set(R.lensProp(currentArea.id), {}, areas);

    if (!area.cmds) {
        area.cmds = {};
    }

    if (!area.cmds[command.trigger]) {
        area.cmds[command.trigger] = {};
    }

    const used = area.cmds[command.trigger].used || 0;
    area.cmds[command.trigger].used = used + 1;

    return R.set(
        R.lensProp('areas'),
        R.set(R.lensProp(currentArea.id), area, areas),
        state
    );
}