
import './index.css';
import * as R from 'ramda';

const foofify = (x: number) => x + 3;

function startApp() {
    console.log('started');
    console.log('test ramda: ' + R.map(foofify, [1, 2, 3]).join('-'));
}

window.onload = () => {
    startApp();
};
