
import { InternalActor } from '../itypes/iactor';
import { Actor } from '../../types/actor';
import { getGameID } from '../gid';

export const convertActor = (a: Actor): InternalActor => {
    return {
        ...a,
        aid: getGameID()
    };
};

