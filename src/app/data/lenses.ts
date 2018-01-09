
import * as R from 'ramda';

type Lens = RamdaDefs.Lens;

type LensComposer = (l1: Lens, l2?: Lens, l3?: Lens) => Lens;
export const compose = R.compose as LensComposer;

export const state = {
    areas: R.lensProp('areas') as Lens,
    currentArea: R.lensProp('currentArea') as Lens,
    vars: R.lensProp('vars') as Lens
};


