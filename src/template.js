
import * as R from 'ramda';

function getValueFromState(pathStr, state, world, rules) {
    const path = pathStr.split('.');

    if (R.path(path, rules.objectAccess)) {
        return R.path(path, state);
    }

    const special = rules[path[0]];
    if (special) {
        return special(state, world);
    }

    throw new Error('Invalid template path: ' + pathStr);
}

function replaceWithRules(str, state, world, rules) {
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
        if (!replacing && symbol === open) {
            if (found === 0) {
                found = 1;
            } else if (found === 1) {
                final += str.slice(Math.max(lastReplaceEnd, 0), i - 1);
                lastReplaceStart = i;
                found = 0;
                replacing = true;
            } else {
                throw new Error('Error in template string: >2 open symbols');
            }
        } else if (replacing && symbol === close) {
            if (found === 0) {
                found = 1;
            } else if (found === 1) {
                const valuePath = str.slice(lastReplaceStart + 1, i - 1);
                final += getValueFromState(valuePath, state, world, rules);
                found = 0;
                lastReplaceEnd = i + 1;
                replacing = false;
            }
        }

        i++;
    };
    final += str.slice(lastReplaceEnd, len);

    return final;
}

const rules = {
    objectAccess: {
        player: {
            name: true,
            health: true,
            items: true,
            vars: true,
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
        currentArea: (state, world) => {
            return world.areas[state.currentArea];
        }
    }
}

export function replaceWithState(str, state, world) {
    return replaceWithRules(str, state, world, rules);
}




