
import { VariableRef, Description, ContentId } from './common';
// import { GNumber, MathOp } from './math';
import { Event } from './event';
import { DamageEvent } from './damage';

export interface Grunt {
    desc: Description;
    chance: number;
}

export interface Actor {
    id: ContentId;

    name: string;

    // Default description.
    desc: Description;

    // Is this NPC permanently friendly?
    alwaysFriendly: boolean;

    // If this NPC can get angry, is it friendly to start with?
    // If it's friendly to start with, it will get angry on attack.
    startsFriendly?: boolean;

    canTurnFriendly?: boolean;

    health: number;

    attack?: {
        dmgEvent: DamageEvent;
        cooldown?: number;
    };

    grunt?: Array<Grunt>;

    commands?: {
        targeted: Array<{
            trigger: string,
            event: Event,
        }>
    };
}

export interface RawActorData {
    lastAttack?: number;
    lastGrunt?: number;
    isAngry?: boolean;
}

export interface RawActorRef<T extends RawActorData> {
    ref: ContentId;
    data?: T
}

