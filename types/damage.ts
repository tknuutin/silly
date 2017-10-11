
import { Description } from './common';
import { GNumber, MathOp } from './math' ;

export interface DamageEvent {
    damage: GNumber | {
        add?: [GNumber, GNumber | MathOp];
        sub?: [GNumber, GNumber | MathOp];
        div?: [GNumber, GNumber | MathOp];
        mul?: [GNumber, GNumber | MathOp];
    };
    desc?: Description;
}
