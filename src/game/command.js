
import * as R from 'ramda';
import * as Logic from './logic';


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