
import { State } from '../data/state';
import { DamageEvent } from '../types/damage';
import * as World from './world';
import * as R from 'ramda';
import { Description } from '../types/common';
import { GNumber, MathOp } from '../types/math' ;
import { isArray, isString } from '../util/utils';
import * as GMath from '../math/math';


export const getDamage = (dmg: DamageEvent, state: State) => {
    return GMath.resolveValue(state, dmg.damage);
};

