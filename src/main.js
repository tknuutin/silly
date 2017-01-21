
import * as Test from './test'
import * as Bacon from 'baconjs';

function textFieldValue(textField) {
    function value() {
        return textField.value;
    }
    return Bacon.fromEvent(textField, "keyup").map(value).toProperty('');
}

function start() {
    Test.doStuff();

    setTimeout(() => {
        console.log('timeout', Bacon);
    }, 500);

    const command = textFieldValue(document.getElementById('command'))
        .filter((value) => value.length > 2);

    command.log();
}

window.onload = start;

