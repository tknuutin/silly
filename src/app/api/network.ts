
import * as Bacon from 'baconjs';
import * as R from 'ramda';

interface HTTPCallback {
    status: number;
    content: string;
}

function httpRequest(url: string, method: string = 'GET') {
    return new Promise((res: (result: HTTPCallback) => void) => {
        const xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function() {
            if (xhr.readyState === XMLHttpRequest.DONE) {
                res({ status: xhr.status, content: xhr.responseText });
            }
        };
        xhr.open(method, url, true);
        xhr.send(null);
    });
}

export function getById(id: string) {
    return getByIds([id]).then((data) => data[id]);
}

const SERVER = 'http://localhost:3002/content/';

function handleError(ids: string[]) {
    return ({ status, content }: HTTPCallback) => {
        if (status !== 200) {
            throw new Error('Error requesting content! ' + ids);
        } else {
            return content;
        }
    };
}

function parseAsJson(content: string) {
    return JSON.parse(content);
}

export function getByIds(ids: string[]) {
    const url = SERVER + '?ids=' + ids.join(',');
    return httpRequest(url)
        .then(handleError(ids))
        .then(parseAsJson);
}


