
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
import { RawActorRef, RawActorData } from '../types/actor';
import * as ActorConvert from '../converters/actor';
import { Description } from '../types/common';
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

function eventDescToLines(desc: Description): string[] {
    if (isArray(desc)) {
        return desc;
    }

    if (isObject(desc)) {
        return desc.text;
    }

    return [desc];
}

export function execEvent(event: Event, state: State): State {
    // debugger;
    if (event.desc) {
        state.output = state.output.concat(applyTemplate(eventDescToLines(event.desc), state));
    }

    state = resolveEventMath(state, event);

    if (event.math) {
        state = R.reduce((state, eventMathOp) => {
            return resolveEventMath(state, eventMathOp);
        }, state, event.math);
    }

    if (event.remove) {
        state = resolveRemove(event.remove, state);
    }

    if (event.give) {
        const give = isArray(event.give) ? event.give : [event.give];
        state.player.items = state.player.items.concat(R.map((giveRef) => {
            const itemDef = World.get<PlayerItemRef>(giveRef.ref);
            return itemDef;
        }, give));
    }

    if (event.spawn) {
        const area = state.currentArea;
        const spawns = isArray(event.spawn) ? event.spawn : [event.spawn];
        
        const itemSpawns = R.filter((x) => !!x, R.map((val) => {
            return val.item;
        }, spawns)) as ItemRef[];
        const actorSpawns = R.filter((x) => !!x, R.map((val) => {
            return val.actor;
        }, spawns)) as RawActorRef<RawActorData>[];

        const areaActors = state.currentArea.actors || [];
        state.currentArea.actors = areaActors.concat(R.map(ActorConvert.convertActor, actorSpawns));

        const areaItems = state.currentArea.items || [];
        state.currentArea.items = areaItems.concat(R.map(ActorConvert.convertActor, actorSpawns));
       
    }

    return state;
}


