
import * as Bacon from 'baconjs';
import * as R from 'ramda';

const STARTSTATE = {
    id: 0,
    lastInput: '',
    lastArea: null,
    cmds: -1,
    game: {
        askedName: false,
        initialized: false,
    },
    time: 0,
    vars: {},
    player: {
        name: '',
        health: 100,
        items: [],
        vars: [],
        stats: {
            brawn: 10,    // strength
            gait: 10,     // speed
            allure: 10,   // charisma
            mind: 10,     // intelligence
            grit: 10,     // stamina
            luck: 10      // yep
        }
    },
    currentArea: null, // set later
    areas: {},
    output: ['Starting game!']
}

const DEBUGSTATE = null;
const DEBUGWORLD = null;


const BUILTINS = {
    'start': {
        state: DEBUGSTATE || STARTSTATE,
        world: DEBUGWORLD || {}
    },
};

function httpRequest(url, method = 'GET') {
    return new Promise((res) => {
        var xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function() {
            if (xhr.readyState == XMLHttpRequest.DONE) {
                res({ status: xhr.status, content: xhr.responseText });
            }
        }
        xhr.open(method, url, true);
        xhr.send(null);
    });
}

export function getById(id) {
    return getByIds([ids]).then((data) => data[id]);
}

const SERVER = 'http://localhost:3000/content/';

function handleError(ids) {
    return ({ status, content }) => {
        if (status !== 200) {
            throw new Error('Error requesting content! ' + ids);
        } else {
            return content;
        }
    }
}

function parseAsJson(content) {
    return JSON.parse(content);
}

export function getByIds(ids) {
    if (ids[0] === 'start') {
        const startAreaId = 'core:area:bedroom';
        return getByIds([startAreaId])
            .then((data) => {
                const area = data[startAreaId];
                const start = R.clone(BUILTINS.start);
                start.state.currentArea = area;
                start.world[startAreaId] = area;
                return { start: start };
            });
    }

    const url = SERVER + '?ids=' + ids.join(',');
    return httpRequest(url)
        .then(handleError(ids))
        .then(parseAsJson);
}


