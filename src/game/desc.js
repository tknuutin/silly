
import * as R from 'ramda';
import { applyTemplate} from './template';
import * as World from './world';
import { isArray, isString, isObject, upper } from './utils'

const getName = (id) => R.toUpper(World.get(id).name);
const getNames = R.map(getName);
const padEmpty = R.prepend('');
const padIfItems = (arr) => arr.length > 0 ? padEmpty(arr) : [];

const filterIds = (ids) =>
    R.filter((objId) => R.any(R.pipe(R.equals(objId), R.not), ids));

const getLines = (ids, objs) =>
    R.pipe(filterIds(ids), getTextForGameObjects, padIfItems)(objs);


function getTextForGameObjects(items) {
    if (!items || items.length < 1 ) {
        return [];
    }

    if (items.length === 1) {
        return [`There is a ${getName(items[0])} here.`];
    }

    const last = getName(R.last(items));
    const rest = getNames(R.init(items)).join(', ');

    return `There is a ${rest} and a ${last} here.`;
}

function areaTransform(state, def) {
    // This is like the best function ive written
    const noDesc = def.noSeparateDesc || [];
    const text = getTextLines(def.text);
    const area = state.currentArea;

    const itemlines = getLines(noDesc, area.items || []);
    const monsterLines = getLines(noDesc, area.monsters || []);

    return text.concat(itemlines).concat(monsterLines);
}

export const transforms = {
    area: areaTransform
}

function getTextLines(def) {
    if (!def) {
        throw new Error('No description: ' + def)
    } else if (isString(def)) {
        return [def];
    } else if (isArray(def)) {
        return def;
    } else {
        throw new Error('Invalid description text: ' + def);
    }
}

export function get(state, def, transform = null) {
    let textArr;
    if (isObject(def)) {
        if (!transform) {
            throw new Error('Invalid description block: ' + trunc(def));
        }
        textArr = transform(state, def);
    } else {
        textArr = getTextLines(def);    
    }
    return applyTemplate(textArr, state);
}

export function areaDesc(state, desc) {
    return get(state, desc, transforms.area);
}

export function itemDesc(state, desc, equipped = false) {
    return get(state, desc, (def) => transform.item(state, def, equipped))
}

