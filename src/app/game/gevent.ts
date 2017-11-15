
import { applyTemplate } from './template';
import { isArray, isObject, dropOne, findObjOperation } from './utils';
import * as Math from './math';
import * as World from './world';
import * as R from 'ramda';
import * as Vars from './vars';
import * as Logic from './logic';

import { State } from './state';
import { Event } from '../types/event';
import { LogicAtom, Combinator } from '../types/logic';

type Condition = LogicAtom | Combinator;
type EventPair = [Condition, Event];
type EventArg = Event | Array<EventPair>;

export function getEvent(eventArg: EventArg, state: any): any {
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

function isItemReference(itemRef: any) {
    return (item: any) => {
        return item.id === itemRef.ref;
    };
}

function areaHasItem(area: any, itemRef: any) {
    // only compare the id for now
    return !R.any(isItemReference(itemRef), area.items);
}

function resolveRemove({ target, item }: any, state: any): any {
    if (item) {
        const itemDef = World.get(item.ref);
        if (target === 'area') {
            if (!areaHasItem(state.currentArea, itemDef)) {
                throw new Error('Could not find item ' + item.ref + ' from area!');
            }
            state.currentArea.items = dropOne(isItemReference(item.ref), state.currentArea.items);
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

export function execEvent(event: any, state: any): any {
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
            const itemDef = World.get(item.ref);
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


