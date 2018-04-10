
import { ActorRef } from '../itypes/iactor';
import { Actor } from '../types/actor';
import * as World from '../game/world';	

export const isAngry = ({ data, ref }: ActorRef): boolean => {
    const def = World.get<Actor>(ref);
    if (!def.alwaysFriendly && !def.startsFriendly) {
        return true;
    }

    if (!data) {
        return false;
    }

    return !!data.isAngry;
};
