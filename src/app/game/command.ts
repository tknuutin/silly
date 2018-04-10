
import * as R from 'ramda';
import * as Logic from '../math/logic';
import * as Desc from '../text/desc';
import { findByName, isObject } from '../util/utils';
import * as World from './world';
import * as Text from '../text/text';

import { Description } from '../types/common';
import { Command } from '../types/command';
import { State, PlayerItemRef } from '../data/state';
import { Area } from '../types/area';
import { Item } from '../types/item';
import { InternalArea } from '../itypes/iarea';
import { Actor } from '../types/actor';
import * as L from '../data/lenses';


export interface InternalCommand extends Command {
    _global?: boolean;
}

type MaybeCommand = InternalCommand | undefined;

function makeInBuiltCommand(name: any, event: any) {
    return {
        trigger: name,
        inbuilt: true,
        events: event
    };
}

function getRef<T>() {
    return R.pipe(R.prop('ref'), (ref: string) => World.get<T>(ref));
}

function getRefs<T>(list: any[] | undefined): T[] {
    return R.map(getRef<T>(), list || []);
}

const currentAreaIsRoom = (area: any) => R.any(R.equals('room'), area.tags);
const makeEvent = (desc: any) => ({ desc });

const toItemAndRefPair = R.map(
    (ref: PlayerItemRef) => [ref, getRef<Item>()(ref)] as [PlayerItemRef, Item]
);

const getPlayerItemMatch = (target: string, itemRefs: PlayerItemRef[]) =>
    R.find(
        ([ref, item]) => item.name === target,
        toItemAndRefPair(itemRefs)
    );

function examine(state: State, match: any, inputCmd: string): Description {
    const target: string = match[1];
    const area = state.currentArea;

    if (!area) {
        throw new Error('No current area!');
    }
    
    if (!target) {
        return ["Examine what?"];
    }

    const targetIsRoom = target === 'room';
    if (targetIsRoom || target === 'area') {
        const desc = Desc.areaDesc(state, area, area.desc);
        if (!targetIsRoom || currentAreaIsRoom(area)) {
            return desc;
        } else {
            return ["This isn't really a room, but ok.", ""].concat(desc);
        }
    }

    const playerItemMatch = getPlayerItemMatch(target, state.player.items);

    if (playerItemMatch) {
        const [playerRef, itemDef] = playerItemMatch;
        const { ref, equipped } = playerRef;
        return Desc.itemDesc(state, itemDef, itemDef.desc, equipped);
    }

    const itemMatch = findByName(target, getRefs<Item>(area.items));
    if (itemMatch) {
        return Desc.itemDesc(state, itemMatch, itemMatch.desc, false);
    }

    const actorMatch = findByName(target, getRefs<Actor>(area.actors || []));
    if (actorMatch) {
        return Desc.monsterDesc(state, actorMatch, actorMatch.desc);
    }

    return ["You don't see any of that around for your eager eyes to peep."];
}

function take(state: any, match: any, inputCmd: string): any {
    const target = match[1];
    const area = state.currentArea;
    
    if (!target) {
        return { desc: Text.takeEmpty() };
    }

    const playerItemMatch = getPlayerItemMatch(target, state.player.items);
    if (playerItemMatch) {
        return { desc: ["You already have that, you horse's ass!"] };
    }

    const areaItems = state.currentArea.items;
    const itemMatch = findByName(target, getRefs<Item>(areaItems));
    if (itemMatch) {
        if (!itemMatch.carry) {
            return { desc: ['You cannot carry that yet!'] };
        }

        const output = isObject(itemMatch.carry) && itemMatch.carry.onPickupDesc
            ? Desc.generic(state, itemMatch.carry.onPickupDesc)
            : [`You pick up the ${itemMatch.name.toUpperCase()}.`];

        return {
            give: {
                item: {
                    ref: itemMatch.id
                }
            },
            removeFromArea: {
                item: {
                    ref: itemMatch.id
                }
            },
            desc: output
        };
    }

    const actorMatch = findByName(target, state.currentArea.actors);
    if (actorMatch) {
        return { desc: ["You cannot and/or won't put that in your pocket!!"] };
    }

    return { desc: Text.takeNonExisting() };
}

const inBuilt = [
    {
        re: /^examine(?: (.*))?$/,
        createEvent: (state: any, match: any, inputCmd: any): any =>
            ({ desc: examine(state, match, inputCmd)})
    },
    {
        re: /^(?:take|grab)(?: (.*))?$/,
        createEvent: take
    }
];

function isCommandAvailable(command: any, currentArea: any, state: State): boolean {
    const areaInfo = state.areas[currentArea.id] || {};
    const usedCmds = areaInfo.cmds || {};
    const { trigger, available, usable, invisible } = command;
    const history = usedCmds[trigger];
    
    return (
        (!history || usable === undefined || usable > history.used) &&
        Logic.isTrue(state, available)
    );
}

export function isCommandVisible(state: any, command: any) {
    return Logic.isTrue(state, command.visible);
}

export function getAvailableAreaCommands(state: State, area: any): InternalCommand[] {
    return R.filter(
        (command) => isCommandAvailable(command, area, state),
        area.commands
    );
}

function getInBuiltCommand(state: any, inputCmd: any): MaybeCommand {
    // debugger;
    const inputChecked = R.map(({ createEvent, re }) =>
        ({ createEvent, match: re.exec(inputCmd) }), inBuilt);

    const matchedInBuilt = R.find(({ match }) => !!match, inputChecked);
    if (matchedInBuilt) {
        const evt = matchedInBuilt.createEvent(state, matchedInBuilt.match, inputCmd);
        return { _global: true, events: [evt], trigger: "" };
    }
    return undefined;
}

function commandTriggerMatches(cmd: any, inputCmd: string): boolean {
    const triggers = [cmd.trigger].concat(cmd.alias || []).concat(cmd.invisibleAlias);
    return R.any(R.equals(inputCmd), triggers);
}

function getAreaCommand(state: State, area: any, inputCmd: string): MaybeCommand {
    const availables = getAvailableAreaCommands(state, area);
    return R.find((cmd) => commandTriggerMatches(cmd, inputCmd), availables);
}

export function getCommand(state: State, area: any, inputCmd: string): MaybeCommand {
    return (
        getAreaCommand(state, area, inputCmd) ||
        getInBuiltCommand(state, inputCmd)
    );
}

export function registerCommandUsed(command: InternalCommand, currentArea: InternalArea, state: State) {
    if (command._global) {
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

    const lCurrentArea = L.compose(L.state.areas, R.lensProp(currentArea.id));

    return R.set(lCurrentArea, area, state);
}
