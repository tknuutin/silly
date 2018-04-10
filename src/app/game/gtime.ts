
import { State } from '../data/state';
import { Event } from '../types/event';
import { DamageEvent } from '../types/damage';
import { Description } from '../types/common';
import { Actor } from '../types/actor';
import { ActorRef } from '../itypes/iactor';
import * as World from './world';
import * as R from 'ramda';
import * as Template from '../text/template';
import { isArray, isString } from '../util/utils';
import * as GDamage from './damage';
import { isAngry } from '../util/gameutil';
import * as L from '../data/lenses';


interface EventResult {
    interrupts: Event[];
    deferred: Event[];   
}

interface TimeResult extends EventResult {
    state: State;
}

const getActorsWithAttacksInPeriod = (afterEv: number, actors: ActorRef[]) =>
    R.map((aref: ActorRef): [DamageEvent | undefined, ActorRef] => {
        if (!isAngry(aref)) {
            return [undefined, aref];
        }

        const def = World.get<Actor>(aref.ref);
        const attack = def.attack;
        const data = aref.data;

        if (attack && data) {
            const lastAttack = data.lastAttack || Number.NEGATIVE_INFINITY;
            const cooldown = attack.cooldown || 5;
            if (lastAttack + cooldown <= afterEv) {
                return [attack.dmgEvent, R.set(L.actorRef.lastAttack, afterEv, aref)];
            }
        }
        return [undefined, aref];
    }, actors);

function getDmgEventDesc(aref: ActorRef, amount: number, dmgDesc: Description | undefined, state: State): Description {
    const actor = World.get<Actor>(aref.ref);
    if (!dmgDesc) {
        return `${actor.name} hits you for ${amount} damage!`;
    }

    const lines: string[] = isArray(dmgDesc) ? dmgDesc :
        (isString(dmgDesc) ? [dmgDesc] : (dmgDesc as any).desc);
    return Template.applyTemplateWithRules(
        lines,
        state,
        Template.makeDmgRules(() => amount + '')
    );
}

function dmgEventToEvent(actor: ActorRef, dmg: DamageEvent, state: State): Event {
    const amount = GDamage.getDamage(dmg, state);
    return {
        desc: getDmgEventDesc(actor, amount, dmg.desc, state),
        time: 0,
        cancel: false,
        math: [
            { sub: ['player:health', amount] }
        ]
    };
}

function resolveActorAttacks(state: State, time: number): TimeResult {
    const ctime = state.time;
    const afterEvent = ctime + time;
    const actors = state.currentArea.actors || [];
    const actorsWithAttacks = getActorsWithAttacksInPeriod(afterEvent, actors);
    return {
        interrupts: R.map(
            ([dmg, actor]) => dmgEventToEvent(actor, dmg, state),
            R.filter(([dmg, actor]) => !!dmg, actorsWithAttacks) as [DamageEvent, ActorRef][],
        ),
        deferred: [],
        state: R.set(
            R.lensPath(['currentArea', 'actors']), actorsWithAttacks, state
        ) as State
    };
}

export function moveTime(state: State, time: number): TimeResult {
    if (time <= 0) {
        return { state, interrupts: [], deferred: [] };
    }

    const area = state.currentArea;

    state.time += time || 5;
    return resolveActorAttacks(state, time);
}



