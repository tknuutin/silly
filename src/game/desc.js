
import * as R from 'ramda';
import { applyTemplate} from './template';
import * as World from './world';
import { isArray, isString, isObject, upper } from './utils'

const getName = ({ ref }) => R.toUpper(World.get(ref).name);
const getNames = R.map(getName);
const padEmpty = R.prepend('');
const padIfItems = (arr) => arr.length > 0 ? padEmpty(arr) : [];

const filterIds = (ids) => {
    return R.filter(({ ref }) => {
        return !R.any((id) => id === ref, ids);
    });
};

const getLines = (idsToFilter, objs) =>
    R.pipe(filterIds(idsToFilter), getTextForGameObjects, padIfItems)(objs);


function getTextForGameObjects(items) {
    if (!items || items.length < 1 ) {
        return [];
    }

    if (items.length === 1) {
        return [`There is a ${getName(items[0])} here.`];
    }

    const last = getName(R.last(items));
    const rest = getNames(R.init(items)).join(', ');

    return [`There is a ${rest} and a ${last} here.`];
}

function getAreaEntitiesDescription(area, toFilter = []) {
    const itemLines = getLines(toFilter, area.items || []);
    const monsterLines = getLines(toFilter, area.monsters || []);
    return itemLines.concat(monsterLines);
}

function areaComplexDescription(state, area, def) {
    const noDesc = def.noSeparateDesc || [];
    const text = getTextLines(def.text);

    return text.concat(getAreaEntitiesDescription(area, noDesc));
}

function itemComplexDescription(state, item, def, equipped) {
    throw new Error('Not implemented: Item had a complex description!');
}

function monsterComplexDescription(state, monster, def) {
    throw new Error('Not implemented: Monster had a complex description!');
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

export function generic(state, def, simpleTransform, complexTransform) {
    let lines;
    if (!isArray(def) && isObject(def)) {
        if (!complexTransform) {
            throw new Error('No complex transform given but complex description encountered!');
        }
        lines = complexTransform();
    } else {
        lines = getTextLines(def).concat(simpleTransform ? simpleTransform() : []);
    }
    return applyTemplate(lines, state);
}

export function areaDesc(state, area, def) {
    const getAreaEntities = () => getAreaEntitiesDescription(area);
    const complexDesc = () => areaComplexDescription(state, area, def);
    return generic(state, def, getAreaEntities, complexDesc);
}

export function itemDesc(state, item, def, equipped = false) {
    return generic(state, def, () => {
        return equipped ? ['You are currently wielding the item.'] : [];
    }, (def) => itemComplexDescription(state, item, def, equipped))
}

export function monsterDesc(state, monster, def) {
    return get(state, def, () => [], (def) => monsterComplexDescription(state, monster, def))
}

