
import * as R from 'ramda';

export type Lens = RamdaDefs.Lens;

export type LensComposer = (l1: Lens, l2?: Lens, l3?: Lens) => Lens;
export const compose = R.compose as LensComposer;
