
import { LogicExpression } from './logic';
import { Event } from './event';

export interface Command {
	// Input trigger for the command.
    trigger: string;

    // How many times can this command be triggered? Default is infinite.
    // For example, make a command that can only be triggered once by setting as 1.
    usable?: number;

    // The possible events that can happen when this command is triggered.
    // If given an array, will sequentially check the events until it founds
    // one that can be triggered. The last event in the array is
    // treated as the default event, and the condition is not checked.
    events: Event | Array<Event>;

    // Is this command visible and triggerable to the player? If this
    // logic expression evaluates to false, it's as if the command
    // did not even exist.
    available?: LogicExpression;
}
