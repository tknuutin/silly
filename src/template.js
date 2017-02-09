
import * as R from 'ramda';

function getValueFromState(pathStr, state, rules) {
    const path = pathStr.split('.');

    if (R.path(path, rules.objectAccess)) {
        return Promise.resolve(R.path(path, state));
    }

    const special = rules.special[path[0]];
    if (special) {
        return special(state);
    }

    throw new Error('Invalid template path: ' + pathStr);
}

function replaceWithRules(str, state, rules) {
    const open = '{';
    const close = '}';

    let final = '';
    const len = str.length;
    let i = 0;
    let replacing = false;
    let found = 0;

    let lastReplaceEnd = 0;
    let lastReplaceStart = 0;

    const step = () => {
        // console.log('stepping..', i);
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
                return getValueFromState(valuePath, state, rules)
                    .then((value) => {
                        final += value;
                        found = 0;
                        lastReplaceEnd = index + 1;
                        replacing = false;
                    });
            }
        }
        return Promise.resolve();
    };

    const checkCondition = () => {
        if (i > 142) {
            debugger;
        }
        if (i > len) {
            final += str.slice(lastReplaceEnd, len);
            return Promise.resolve();
        }
        return iterate();
    }

    // well this shit is stupid
    const iterate = () => {
        console.log('iterating..', i);
        return step().then(checkCondition);
    };

    return iterate().then((x) => {
        console.log('final resolve', x);
        return final;
    });
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
        currentArea: (state) => {
            return new Promise((res) => {
                // for testing
                setTimeout(() => {
                    res(state.currentArea.name);
                }, 300);
            });
        }
    }
}

export function replaceWithState(str, state) {
    return replaceWithRules(str, state, rules);
}




