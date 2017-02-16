
import { Description, VariableRef } from './common';

export interface Event {
	// Event description that will be printed when the event occurs.
	// If no description is given, will autogenerate.
    desc?: Description;

    // Set a game variable to a given value.
    set?: [VariableRef, number];
}
