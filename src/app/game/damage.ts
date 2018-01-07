
import { State } from './state';
import { DamageEvent } from '../types/damage';
import * as World from './world';
import * as R from 'ramda';
import { Description } from '../types/common';
import { GNumber, MathOp } from '../types/math' ;
import { isArray, isString } from './utils';
import * as GMath from './math';


export const getDamage = (dmg: DamageEvent, state: State) => {
    return GMath.resolveValue(state, dmg.damage);
};

