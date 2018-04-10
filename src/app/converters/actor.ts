
import { ActorRef, ActorData } from '../itypes/iactor';
import { RawActorRef, RawActorData } from '../types/actor';
import { getGameID } from '../util/gid';

export const convertActor = (a: RawActorRef<RawActorData>): ActorRef => {
    return {
        ref: a.ref,
        _type: 'actor',
        aid: getGameID(),
        data: a.data
    };
};

