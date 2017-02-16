
import * as Bacon from 'baconjs';
import * as R from 'ramda';

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
    const url = SERVER + '?ids=' + ids.join(',');
    return httpRequest(url)
        .then(handleError(ids))
        .then(parseAsJson);
}


