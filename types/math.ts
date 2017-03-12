
import { VariableRef } from './common';

export type GNumber = number | VariableRef;

export interface AddOp {
    add: [GNumber | Math, GNumber | Math];
}

export interface SubtractOp {
    sub: [GNumber | Math, GNumber | Math];
}

export interface DivideOp {
    div: [GNumber | Math, GNumber | Math];
}

export interface MultiplyOp {
    mul: [GNumber | Math, GNumber | Math];
}

export type Math = AddOp | SubtractOp | DivideOp | MultiplyOp;

