
import * as Test from './test'
import $ from './jqueryp';
import * as Bacon from 'baconjs';
import * as Network from './network';
import * as BJQ from 'bacon.jquery';

function start() {
    Test.doStuff();

    const commandInput = $('#command');
    const command = BJQ.textFieldValue(commandInput)
        .filter((value) => value.length > 2);

    command.log();

    const startDataResponse = Network.getStartData();
}

window.onload = start;

