
import { RawActorData, Actor, RawActorRef } from '../types/actor';


export interface ActorData extends RawActorData {

}

export interface ActorRef extends RawActorRef<ActorData> {
    _type: 'actor';
    aid: string;
}
