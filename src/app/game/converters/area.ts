
import { InternalArea } from '../itypes/iarea';
import { Area, ActorRef } from '../../types/area';
import { convertActor } from './actor';
import * as R from 'ramda';
import * as World from '../world';

const convertActorRefs = R.map((ref: ActorRef) =>
    convertActor(World.get(ref.ref)));

export const convertArea = (a: Area): InternalArea => {
    return {
        refs: a.refs,
        id: a.id,
        tags: a.tags,
        name: a.name,
        desc: a.desc,
        firstDesc: a.firstDesc,
        commands: a.commands,
        items: a.items,
        actors: a.actors ? convertActorRefs(a.actors) : a.actors
    };
};

