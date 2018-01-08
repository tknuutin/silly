
import { VariableRef, Description, ContentId } from './common';
// import { GNumber, MathOp } from './math';
import { Event } from './event';
import { DamageEvent } from './damage';


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

    grunt?: Array<{
        desc: Description;
        chance: number;
    }>;

    commands?: {
        targeted: Array<{
            trigger: string,
            event: Event,
        }>
    }
}

