
import * as Vars from './vars';
import { applyTemplate } from './template';
import { isArray, dropOne } from './utils';
import * as World from './world';
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

function isItemReference(itemRef) {
    return (item) => {
        return item.id === itemRef.ref;
    }
}

function areaHasItem(area, itemRef) {
    // only compare the id for now
    return !R.any(isItemReference(itemRef), area.items);
}

function resolveRemove({ target, item }) {
    if (item) {
        const itemDef = World.get(item.ref);
        if (target === 'area') {
            if (!areaHasItem(state.currentArea, itemRef)) {
                throw new Error('Could not find item ' + item.ref + ' from area!');
            }
            state.currentArea.items = dropOne(isItemReference(item.ref), list);
            state.player.items = state.player.items.concat([itemDef]);
        }
    }

    return state;
}

export function execEvent(event, state) {
    if (event.desc) {
        state.output = state.output.concat(applyTemplate(event.desc, state));
    }

    if (event.set) {
        const [varId, value] = event.set;
        state = Vars.set(varId, value, state);
    }

    if (event.remove) {
        state = resolveRemove(event.remove);
    }

    if (event.give) {
        const { item } = event.give;
        if (item) {
            const itemDef = World.get(item.ref);
            state.player.items = state.player.items.concat([itemDef]);
        }
    }

    return state;
}


