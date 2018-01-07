
import { State } from './state';
import { Event } from '../types/event';
import { DamageEvent } from '../types/damage';
import { Description } from '../types/common';
import { InternalActor } from './itypes/iactor';
import * as World from './world';
import * as R from 'ramda';
import * as Template from './template';
import { isArray, isString } from './utils';
import * as GDamage from './damage';

interface EventResult {
    interrupts: Event[];
    deferred: Event[];   
}

interface TimeResult extends EventResult {
    state: State;
}

const getActorsWithAttacksInPeriod = (afterEv: number, actors: InternalActor[]) =>
    R.map((a: InternalActor): [DamageEvent | undefined, InternalActor] => {
        if (a.alwaysFriendly || (a.startsFriendly && !a.isAngry)) {
            return [undefined, a];
        }

        const attack = a.attack;

        if (attack) {
            const lastAttack = a.lastAttack || Number.NEGATIVE_INFINITY;
            const cooldown = attack.cooldown || 5;
            if (lastAttack + cooldown <= afterEv) {
                return [attack.dmgEvent, R.merge(a, {
                    lastAttack: afterEv,
                })];
            }
        }
        return [undefined, a];
    }, actors);

function getDmgEventDesc(actor: InternalActor, amount: number, dmgDesc: Description | undefined, state: State): Description {
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

function dmgEventToEvent(actor: InternalActor, dmg: DamageEvent, state: State): Event {
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
            R.filter(([dmg, actor]) => !!dmg, actorsWithAttacks) as [DamageEvent, InternalActor][],
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



