
import * as Vars from './vars';
import { applyTemplate } from './template';
import { isArray } from './utils';
import * as R from 'ramda';


export function getEvent(events, state) {
    if (!isArray(events)) {
        events = [events];
    }

    const defEvent = R.last(events);

    const firstMatchingOutcome = R.find(([predicate, event]) => {
        if (!predicate || !event) {
            throw new Error('Invalid event definition');
        }

        return Logic.isTrue(predicate, state);
    });

    const match = firstMatchingOutcome(R.init(events));
    if (!match) {
        return isArray(defEvent) ? R.last(defEvent) : defEvent;
    }

    return match;
}

export function execEvent(event, state) {
    if (event.desc) {
        state.output.push(applyTemplate(event.desc, state));
    }

    if (event.set) {
        const [varId, value] = event.set;
        state = Vars.set(varId, value, state);
    }

    return state;
}


