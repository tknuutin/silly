
import { State } from '../data/state';
import { Event } from '../types/event';
import { DamageEvent } from '../types/damage';
import { Description } from '../types/common';
import { Actor, RawActorRef, Grunt } from '../types/actor';
import { ActorRef, ActorData } from '../itypes/iactor';
import * as World from './world';
import * as R from 'ramda';
import * as Template from '../text/template';
import * as Desc from '../text/desc';
import { isArray, isString } from '../util/utils';
import * as GDamage from './damage';
import { isAngry } from '../util/gameutil';
import * as L from '../data/lenses';
import * as A from '../data/accessor';


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
        if (!aref.data) {
            aref.data = {};
        }

        if (attack) {
            const lastAttack = aref.data.lastAttack || Number.NEGATIVE_INFINITY;
            const cooldown = attack.cooldown || 5;
            if (lastAttack + cooldown <= afterEv) {
                const newActRef = A.actorRef.lastAttack(afterEv, aref);
                return [attack.dmgEvent, newActRef];
            }
        }
        // debugger;
        return [undefined, aref];
    }, actors);

function getDmgEventDesc(aref: ActorRef, amount: number, dmgDesc: Description | undefined, state: State): Description {
    const actor = World.get<Actor>(aref.ref);
    if (!dmgDesc) {
        return `${actor.name.toUpperCase()} hits you for ${amount} damage!`;
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
        state
    };
}

const lOut = R.lensProp('output');
const addOutput: (lines: string[], s: State) => State = R.set(lOut);

function resolveActorGrunt(state: State, time: number): State {
    const actors = state.currentArea.actors || [];
    // let grunt: string | undefined = undefined;

    const hasAngry = R.any(isAngry, actors);
    const shouldHaveSomeGrunt = Math.random() > 0.6;  // 40% chance of getting some grunt
    if (!hasAngry || !shouldHaveSomeGrunt) {
        return state;
    }

    const grunt: Grunt | undefined = R.find((g) => !!g, R.map((ref) => {
        const actor = World.get<Actor>(ref.ref);
        const grunts = actor.grunt || [];
        const hit = R.find((grunt) => {
            const roll = Math.random();

            // Actors define a chance for a grunt between 0 and 100.
            // It's a relative value between all grunts. There's only ever
            // a maximum of 75% chance of a given grunt to happen.
            const limit = ((Math.min(grunt.chance, 100) / 100) * 0.75);
            return limit > roll;
        }, grunts);
        return hit;
    }, actors));

    if (!grunt) {
        return addOutput(["Your blood is chilled by the violence you're witnessing!"], state);
    }

    const desc = Desc.simpleDesc(state, grunt.desc);
    return addOutput(desc, state);
}

export function moveTime(state: State, time: number): TimeResult {
    if (time <= 0) {
        return { state, interrupts: [], deferred: [] };
    }

    const area = state.currentArea;

    state.time += time || 5;
    return R.pipe(
        (state: State) => resolveActorAttacks(state, time),
        (result: TimeResult) => R.assoc('state', resolveActorGrunt(result.state, time), result)
        // more stuff here that happens because of time moving...
    )(state);
}



