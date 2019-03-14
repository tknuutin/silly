
import * as L from './lenses';
import * as R from 'ramda';
import { ActorRef } from '../itypes/iactor';

type Lens = RamdaDefs.Lens;

// I think this is getting a bit insane but whatever
const setActRef = <T>(l: Lens): ((val: T, o: ActorRef) => ActorRef) => R.set(l);
export const actorRef = {
    lastAttack: setActRef<number>(L.actorRef.lastAttack),
};

