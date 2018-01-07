
import { Description, VariableRef, ContentId, TargetRef } from './common';
import { GNumber, MathOp } from './math';

type EventMathOperation = [VariableRef, GNumber | MathOp];
interface MathOperationOwner {
    // Set a variable to something that resolves to a number.
    set?: [VariableRef, GNumber | MathOp];

    // Add something that resolves to a number to a variable.
    add?: [VariableRef, GNumber | MathOp];

    // Subtract something that resolves to a number frmo a variable.
    sub?: [VariableRef, GNumber | MathOp];

    // Divide a variable with something that resolves a number.
    div?: [VariableRef, GNumber | MathOp];

    // Multiply a variable with something that resolves a number.
    mul?: [VariableRef, GNumber | MathOp];
}

interface ItemRef {
    ref: ContentId;
}

interface MonsterRef {
    ref: ContentId;
}

interface SpawnEvent {
    item?: ItemRef;
    monster?: MonsterRef;
}

interface RemoveEvent {
    target: TargetRef;
    item?: {
        ref: ContentId
    };
}

export interface Event extends MathOperationOwner {
    // Event description that will be printed when the event occurs.
    // If no description is given, will autogenerate.
    desc?: Description;

    time?: number;

    // If this event is in a chain of events, should we cancel the following events?
    // Example: if something that happens because of a monster attack due should
    // cancel the action the player is about to make. Maybe?? Idk.
    cancel?: boolean;

    // Math operations. Use this to do more than one variable
    // change per event.
    math?: Array<MathOperationOwner>;

    // Give an item or other thingy to the player
    give?: ItemRef | Array<ItemRef>;

    // Spawn an item or monster in the current area
    spawn?: SpawnEvent | Array<SpawnEvent>;

    // Remove something from the target.
    remove?: RemoveEvent | Array<RemoveEvent>;

    move?: ContentId;
}
