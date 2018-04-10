
import { applyTemplate } from '../text/template';
import { isArray, isObject, dropOne, findObjOperation } from '../util/utils';
import * as Math from '../math/math';
import * as World from './world';
import * as R from 'ramda';
import * as Vars from './vars';
import * as Logic from '../math/logic';
import { InternalArea } from '../itypes/iarea';

import { State, PlayerItemRef } from '../data/state';
import { Item, ItemRef } from '../types/item';
import { Event } from '../types/event';
import { LogicAtom, Combinator } from '../types/logic';

type Condition = LogicAtom | Combinator;
type EventPair = [Condition, Event];
type EventArg = Event | Array<EventPair>;

export function getEvent(eventArg: EventArg, state: State): any {
    let events: Array<EventPair>;

    if  (!isArray(eventArg)) {
        const cond: Condition = { value: true };
        events = [[cond, eventArg]];
    } else {
        events = eventArg;
    }

    const defEvent = R.last(events);

    const firstMatchingOutcome = R.find(([predicate, event]) => {
        if (!predicate || !event) {
            throw new Error('Invalid event definition');
        }

        return Logic.isTrue(state, predicate);
    });

    const match = firstMatchingOutcome(R.init(events));
    if (!match) {
        return isArray(defEvent) ? R.last(defEvent) : defEvent;
    }

    return R.last(match);
}

function isItemReference(itemRef: PlayerItemRef) {
    return (item: ItemRef) => {
        return item.ref === itemRef.ref;
    };
}

function areaHasItem(area: InternalArea, itemRef: PlayerItemRef) {
    // only compare the id for now
    return !R.any(isItemReference(itemRef), area.items || []);
}

function resolveRemove({ target, item }: any, state: State): any {
    if (item) {
        const itemDef = World.get<PlayerItemRef>(item.ref);
        if (target === 'area') {
            const cArea = state.currentArea;
            if (!cArea || !areaHasItem(cArea, itemDef)) {
                throw new Error('Could not find item ' + item.ref + ' from area!');
            }
            cArea.items = dropOne(isItemReference(item.ref), cArea.items || []);
            state.player.items = state.player.items.concat([itemDef]);
        }
    }

    return state;
}

const OPS = {
    set: Vars.set,
    add: Vars.add,
    sub: Vars.sub,
    div: Vars.div,
    mul: Vars.mul
};

function resolveEventMath(state: State, mathDef: any) {
    const { opname, func } = findObjOperation(OPS, mathDef);
    if (!func || !opname) {
        return state;
    }

    const varId = mathDef[opname][0];
    const value = mathDef[opname][1];

    return func(varId, value, state);
}

export function execEvent(event: any, state: State): State {
    // debugger;
    if (event.desc) {
        state.output = state.output.concat(applyTemplate(event.desc, state));
    }

    state = resolveEventMath(state, event);

    if (event.math) {
        state = R.reduce((state, eventMathOp) => {
            return resolveEventMath(state, eventMathOp);
        }, state, event.math);
    }

    if (event.remove) {
        state = resolveRemove(state, event.remove);
    }

    if (event.give) {
        const { item } = event.give;
        if (item) {
            const itemDef = World.get<PlayerItemRef>(item.ref);
            state.player.items = state.player.items.concat([itemDef]);
        }
    }

    if (event.spawn) {
        const area = state.currentArea;
        const { spawn } = event.spawn;
        if (spawn) {
            const { item, monster } = spawn;
            if (item) {
                const itemDef = World.get(item.ref);
                
            }
        }
    }

    return state;
}


