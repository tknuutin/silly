
import { InternalActor } from '../itypes/iactor';
import { Actor } from '../types/actor';
import { getGameID } from '../util/gid';

export const convertActor = (a: Actor): InternalActor => {
    return {
        ...a,
        aid: getGameID()
    };
};

