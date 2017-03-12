
import { Description, VariableRef, ContentId, TargetRef } from './common';
import { GNumber, Math } from './math';

type EventMathOperation = [VariableRef, GNumber | Math];
interface MathOperationOwner {
    // Set a variable to something that resolves to a number.
    set?: [VariableRef, GNumber | Math];

    // Add something that resolves to a number to a variable.
    add?: [VariableRef, GNumber | Math];

    // Subtract something that resolves to a number frmo a variable.
    sub?: [VariableRef, GNumber | Math];

    // Divide a variable with something that resolves a number.
    div?: [VariableRef, GNumber | Math];

    // Multiply a variable with something that resolves a number.
    mul?: [VariableRef, GNumber | Math];
}

export interface Event extends MathOperationOwner {
    // Event description that will be printed when the event occurs.
    // If no description is given, will autogenerate.
    desc?: Description;

    // Math operations. Use this to do more than one variable
    // change per event.
    math?: Array<MathOperationOwner>;

    // Give an item or other thingy to the player
    give?: {
        item?: {
            ref: ContentId;
        };
    };

    // Remove something from the target.
    remove?: {
        target: TargetRef;
        item?: {
            ref: ContentId
        };
    };
}
