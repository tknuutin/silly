
import { ActorRef } from '../itypes/iactor';

export function isActor(a: any): a is ActorRef {
    return (typeof a === 'object') && a._type === 'actor';
}

export type WithRef = { ref: string };
export function isRef(a: any): a is WithRef {
    return (typeof a === 'object' && typeof a.ref === 'string');
}

