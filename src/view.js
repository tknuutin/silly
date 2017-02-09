
import * as Bacon from 'baconjs';
import $ from './jqueryp';
import * as BJQ from 'bacon.jquery';
import * as R from 'ramda';


function submitOnEnter(evt, inputEl) {
    if (evt.which == 13) {
        inputEl.submit();
        return false;
    }
}

function addTextParagraph(text, el) {
    const p = $(document.createElement('p'));
    p.text(text);
    el.append(p);
}

function initInput(commandInput) {
    commandInput.blurE().onValue(() => {
        commandInput.focus();
    });

    commandInput.keypressE().onValue((evt) => submitOnEnter(evt, commandInput));

    const input = BJQ.textFieldValue(commandInput);
    const fakeInputText = $('#fakeinputtext');
    input.onValue((val) => {
        console.log('value yo');
        fakeInputText.text(val);
    });

    const valid = (text) => text && text[0].match(/[A-Za-z]/); 
    const inputIsValid = input.map(valid).toProperty();
    const inputIsInvalid = inputIsValid.not();
    const validInput = input.filter(inputIsValid);

    const validCommands = commandInput.submitE()
        .map(() => commandInput.val())
        .toProperty()
        .filter(inputIsValid);

    validCommands.onValue(() => commandInput.val(''));
    return { input, validInput, validCommands };
}

export function createView() {
    const commandInput = $('#command');
    const { input, validInput, validCommands } = initInput(commandInput);
    commandInput.focus();

    const screen = $('#screen');
    const suggDiv = $('#suggestions');

    const print = (text) => addTextParagraph(text, screen);
    const showSuggestions = (suggestions) => {
        suggDiv.empty();
        if (suggestions && suggestions.length > 0) {
            R.forEach((text) => {
                addTextParagraph(text, suggDiv);
            }, suggestions);
        }
    }

    return {
        print, showSuggestions,
        invalidInput: input,
        validInput: validInput,
        commands: validCommands,
    }
}