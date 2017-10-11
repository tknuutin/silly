
import { VariableRef } from './common';

export type GNumber = number | VariableRef;

export interface AddOp {
    add: [GNumber | MathOp, GNumber | MathOp];
}

export interface SubtractOp {
    sub: [GNumber | MathOp, GNumber | MathOp];
}

export interface DivideOp {
    div: [GNumber | MathOp, GNumber | MathOp];
}

export interface MultiplyOp {
    mul: [GNumber | MathOp, GNumber | MathOp];
}

export type MathOp = AddOp | SubtractOp | DivideOp | MultiplyOp;

