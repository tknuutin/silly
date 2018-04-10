
import { InternalArea } from '../itypes/iarea';
import { Area } from '../types/area';
import { convertActor } from './actor';
import * as R from 'ramda';
import * as World from '../game/world';

const convertActorRefs = R.map(convertActor);

export const convertArea = (a: Area): InternalArea => {
    const actors = a.actors ? convertActorRefs(a.actors) : a.actors;
    return {
        refs: a.refs,
        id: a.id,
        tags: a.tags,
        name: a.name,
        desc: a.desc,
        firstDesc: a.firstDesc,
        commands: a.commands,
        items: a.items,
        actors
    };
};

