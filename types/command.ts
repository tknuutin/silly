
import { LogicExpression } from './logic';
import { Event } from './event';

export interface Command {
    trigger: string;
    usable?: number;
    events: Event | Array<Event>;
    available?: LogicExpression;
}
