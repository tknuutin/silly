
import * as R from 'ramda';
import * as Logic from './logic';
import { areaDesc } from './desc';
import { findByProp } from './utils';

function makeInBuiltCommand(name, event) {
    return {
        trigger: name,
        inbuilt: true,
        events: event
    }
}

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
        const desc = areaDesc(state, area.desc);
        if (!targetIsRoom || currentAreaIsRoom(area)) {
            return desc;
        } else {
            return ["This isnt't really a room, but ok.", ""].concat(desc);
        }
    }

    const gameObjs = state.player.items.concat(items).concat(monsters);
    const examinable = findByProp(R.prop('name'), target, gameObjs);
    if (examinable) {
        return 
    } else {
        return ["You don't see any of that around for your eager eyes to peep."];
    }
}

const inBuilt = {
    examine: {
        re: /^examine(?: (.*))?$/,
        use: (state, match, inputCmd) => makeEvent(examine(state, match))
    } 
}

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

export function getAvailableCommands(state, area) {
    return R.filter(
        (command) => isCommandAvailable(command, area, state),
        area.commands
    );
}

export function getInBuiltCommand(inputCmd) {

}

export function getCommand(state, area, inputCmd) {
    const availables = getAvailableCommands(state, area);
    return R.find(({ trigger }) => trigger === inputCmd, availables);
}

export function useCommand(command, currentArea, state) {
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
        l.areas,
        R.set(R.lensProp(currentArea.id), area, areas),
        state
    );
}