
import * as R from 'ramda';
import { STARTSTATE } from './defaultState';
import * as LU from './lensUtils';
import { lensify } from './structure';

export const state = lensify(STARTSTATE);

const lData = R.lensProp('data');

export const compose = LU.compose;

export const actorRef = {
    lastAttack: compose(lData, R.lensProp('lastAttack'))
};


