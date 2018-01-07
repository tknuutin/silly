
import * as R from 'ramda';
import { ensureArray } from './utils';

import { State } from './state';

function getValueFromState(pathStr: string, state: State, rules: Rules): string {
    const path = pathStr.split('.');

    if (R.path(path, rules.objectAccess)) {
        return R.path(path, state) as string;
    }

    const special = rules.special[path[0]];
    if (special) {
        return special(state);
    }

    throw new Error('Invalid template path: ' + pathStr);
}

function replaceWithRules(str: string, state: State, rules: Rules): string {
    // This whole function is a bit dump
    const open = '{';
    const close = '}';

    let final = '';
    const len = str.length;
    let i = 0;
    let replacing = false;
    let found = 0;

    let lastReplaceEnd = 0;
    let lastReplaceStart = 0;

    // JEesus look at this thing
    while (i < len) {
        const symbol = str[i];
        const index = i;
        i++;

        if (!replacing && symbol === open) {
            if (found === 0) {
                found = 1;
            } else if (found === 1) {
                // Uhh this feels a bit odd
                final += str.slice(Math.max(lastReplaceEnd, 0), index - 1);
                lastReplaceStart = index;
                found = 0;
                replacing = true;
            } else {
                throw new Error('Error in template string: >2 open symbols');
            }
        } else if (replacing && symbol === close) {
            if (found === 0) {
                found = 1;
            } else if (found === 1) {
                // AAaaah
                const valuePath = str.slice(lastReplaceStart + 1, index - 1);
                const text = getValueFromState(valuePath, state, rules);
                final += text;
                found = 0;
                lastReplaceEnd = index + 1;
                replacing = false;
            }
        }
    }

    final += str.slice(lastReplaceEnd, len);
    return final;
}

interface Rules {
    objectAccess: {
        player: {
            name: boolean;
            health: boolean;
            stats: {
                brawn: boolean;
                gait: boolean;
                allure: boolean;
                mind: boolean;
                grit: boolean;
                luck: true;
            };
        };
    };
    special: {
        [index: string]: (state: State) => string;
    };
}

export const DEF_RULES: Rules = {
    objectAccess: {
        player: {
            name: true,
            health: true,
            stats: {
                brawn: true,
                gait: true,
                allure: true,
                mind: true,
                grit: true,
                luck: true
            }
        },
    },
    special: {
        currentArea: (state: any) => {
            return state.currentArea.name;
        }
    }
};

export const makeDmgRules = (hitDmg: (state: State) => string): Rules =>
    R.set(R.lensPath(['special', 'hitDmg']), hitDmg, DEF_RULES);


export const applyTemplateWithRules = (lines: string[], state: State, rules: Rules): string[] => {
    return R.map((line: string) => {
        return replaceWithRules(line, state, rules);
    }, ensureArray(lines));
};

export const applyTemplate = (lines: string[], state: State): string[] =>
    applyTemplateWithRules(lines, state, DEF_RULES);




