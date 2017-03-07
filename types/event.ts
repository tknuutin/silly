
import { Description, VariableRef, ContentId, TargetRef } from './common';

export interface Event {
    // Event description that will be printed when the event occurs.
    // If no description is given, will autogenerate.
    desc?: Description;

    // Set a game variable to a given value.
    set?: [VariableRef, number];

    // Give an item or other thingy to the player
    give?: {
        item?: {
            ref: ContentId;
        };
    };

    // Remove something from the target.
    remove: {
        target: TargetRef;
        item?: {
            ref: ContentId
        };
    };
}
