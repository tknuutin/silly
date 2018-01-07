
import * as R from 'ramda';
import { applyTemplate } from './template';
import * as World from './world';
import { isArray, isString, isObject, upper } from './utils';

import { Description } from '../types/common';
import { Item } from '../types/item';
import { State } from './state';

const getName = ({ ref }: { ref: string }) => R.toUpper(World.get<{ name: string }>(ref).name);
const getNames = R.map(getName);
const padEmpty = R.prepend('');
function padIfItems(arr: string[]): string[] {
    return arr.length > 0 ? padEmpty(arr) : [];
}

const filterIds = (ids: any[]) => {
    return R.filter(({ ref }) => {
        return !R.any((id) => id === ref, ids);
    });
};

const getLines = (idsToFilter: any, objs: any) =>
    R.pipe(filterIds(idsToFilter), getTextForGameObjects, padIfItems)(objs);


function getTextForGameObjects(items: any) {
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

function getAreaEntitiesDescription(area: any, toFilter: any[] = []): string[] {
    const itemLines = getLines(toFilter, area.items || []);
    const monsterLines = getLines(toFilter, area.monsters || []);
    return itemLines.concat(monsterLines);
}

function areaComplexDescription(state: any, area: any, def: any): string[] {
    const noDesc = def.noSeparateDesc || [];
    const text = getTextLines(def.text);

    return text.concat(getAreaEntitiesDescription(area, noDesc));
}

function itemComplexDescription(state: any, item: any, def: any, equipped: any): Description {
    throw new Error('Not implemented: Item had a complex description!');
}

function monsterComplexDescription(state: any, monster: any, def: any): Description {
    throw new Error('Not implemented: Monster had a complex description!');
}

function getTextLines(def: any): string[] {
    if (!def) {
        throw new Error('No description: ' + def);
    } else if (isString(def)) {
        return [def];
    } else if (isArray<string>(def)) {
        return def;
    } else {
        throw new Error('Invalid description text: ' + def);
    }
}

export function generic(state: State, def: any, simpleTransform?: any, complexTransform?: any) {
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

export function areaDesc(state: State, area: any, def: any) {
    const getAreaEntities = () => getAreaEntitiesDescription(area);
    const complexDesc = () => areaComplexDescription(state, area, def);
    return generic(state, def, getAreaEntities, complexDesc);
}

export function itemDesc(state: State, item: any, def: any, equipped: boolean = false) {
    return generic(state, def, () => {
        return equipped ? ['You are currently wielding the item.'] : [];
    }, (def: any) => itemComplexDescription(state, item, def, equipped));
}

export function monsterDesc(state: State, monster: any, def: any) {
    return generic(state, def, () => [], (def: any) =>
        monsterComplexDescription(state, monster, def)
    );
}

