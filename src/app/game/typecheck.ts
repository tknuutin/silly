
import { InternalActor } from '../itypes/iactor';

export function isIActor(a: any): a is InternalActor {
    return (typeof a === 'object') && a._type === 'actor';
}

export type WithRef = { ref: string };
export function isRef(a: any): a is WithRef {
    return (typeof a === 'object' && typeof a.ref === 'string');
}

