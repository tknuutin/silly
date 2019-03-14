
import * as R from 'ramda';
import { applyTemplate } from './template';
import * as World from '../game/world';
import * as TC from '../game/typecheck';
import { isArray, isString, isObject, upper } from '../util/utils';
import { InternalArea } from '../itypes/iarea';
import { ActorRef } from '../itypes/iactor';
import { Description, DescriptionObject } from '../types/common';
import { Item, ItemRef } from '../types/item';
import { State } from '../data/state';
import { isAngry } from '../util/gameutil';


type GameObject = ItemRef | ActorRef;

const getName = (obj: GameObject) => {
    if (!TC.isRef(obj)) {
        throw new Error('what');
    }
    const name = World.get<{ name: string }>(obj.ref).name;

    if (name === undefined) {
        throw new Error('Unrecognized type in getName');
    }
    return R.toUpper(name);    
};

const getNames = R.map(getName);
const padEmpty = R.prepend('');
function padIfItems(arr: string[]): string[] {
    return arr.length > 0 ? padEmpty(arr) : [];
}

const filterIds = (ids: string[]) => {
    return R.filter(({ ref }: { ref: string }) => {
        return !R.any((id) => id === ref, ids);
    });
};

const getLines = (idsToFilter: string[], objs: GameObject[]) =>
    R.pipe(filterIds(idsToFilter), getTextForGameObjects, padIfItems)(objs);

function getTextForGameObjects(items: GameObject[]) {
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

function getAreaEntitiesDescription(area: InternalArea, toFilter: string[] = []): string[] {
    const itemLines = getLines(toFilter, area.items || []);
    const actors = area.actors || [];
    const monsterLines = R.concat(
        getLines(toFilter, actors),
        R.map((aref: ActorRef) => {
            const name = getName(aref);
            return `${name} is enraged by your presence!`;
        }, R.filter(isAngry, actors))
    );
    return itemLines.concat(monsterLines);
}

function areaComplexDescription(state: State, area: InternalArea, def: DescriptionObject): string[] {
    const noDesc = def.noSeparateDesc || [];
    const text = getTextLines(def.text);

    return text.concat(getAreaEntitiesDescription(area, noDesc));
}

function itemComplexDescription(state: State, item: any, def: DescriptionObject, equipped: any): Description {
    throw new Error('Not implemented: Item had a complex description!');
}

function monsterComplexDescription(state: State, actor: ActorRef, def: DescriptionObject): Description {
    throw new Error('Not implemented: Actor had a complex description!');
}

function getTextLines(def: Description): string[] {
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

export function areaDesc(state: State, area: InternalArea, def: Description) {
    const getAreaEntities = () => getAreaEntitiesDescription(area);
    const complexDesc = () => areaComplexDescription(state, area, def as DescriptionObject);
    return generic(state, def, getAreaEntities, complexDesc);
}

export function itemDesc(state: State, item: any, def: any, equipped: boolean = false) {
    return generic(state, def, () => {
        return equipped ? ['You are currently wielding the item.'] : [];
    }, (def: any) => itemComplexDescription(state, item, def, equipped));
}

export function monsterDesc(state: State, actor: any, def: any) {
    return generic(state, def, () => [], (def: any) =>
        monsterComplexDescription(state, actor, def)
    );
}

export function simpleDesc(state: State, desc: Description): string[] {
    if (isObject(desc) && !isArray(desc)) {
        return simpleDesc(state, desc.text);
    }
    const lines = isArray(desc) ? desc : [desc];
    return applyTemplate(lines, state);
}

