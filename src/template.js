
import * as R from 'ramda';
import { ensureArray } from './utils';

function getValueFromState(pathStr, state, rules) {
    const path = pathStr.split('.');

    if (R.path(path, rules.objectAccess)) {
        return R.path(path, state);
    }

    const special = rules.special[path[0]];
    if (special) {
        return special(state);
    }

    throw new Error('Invalid template path: ' + pathStr);
}

function replaceWithRules(str, state, rules) {
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
                const valuePath = str.slice(lastReplaceStart + 1, index - 1);
                const text = getValueFromState(valuePath, state, rules);
                final += text;
                found = 0;
                lastReplaceEnd = index + 1;
                replacing = false;
            }
        }
    };

    final += str.slice(lastReplaceEnd, len);
    return final;
}

const rules = {
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
        currentArea: (state) => {
            return state.currentArea.name;
        }
    }
}

function applyTemplateToLine(str, state) {
    return replaceWithRules(str, state, rules);
}

export const applyTemplate = (lines, state) =>
    R.map((line) => applyTemplateToLine(line, state), ensureArray(lines))




