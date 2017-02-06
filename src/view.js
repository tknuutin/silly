
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

export function createView() {
    const commandInput = $('#command');
    commandInput.keypressE().onValue((evt) => submitOnEnter(evt, commandInput));

    const input = BJQ.textFieldValue(commandInput);

    const valid = (text) => text.length > 2; 
    const inputIsValid = input.map(valid).toProperty();
    const inputIsInvalid = inputIsValid.not();
    const validInput = input.filter(inputIsValid);

    const validCommands = commandInput.submitE()
        .map(() => commandInput.val())
        .toProperty()
        .filter(inputIsValid);

    validCommands.onValue(() => commandInput.val(''));

    const screen = $('#screen');
    const suggDiv = $('#suggestions');

    return {
        print: (text) => addTextParagraph(text, screen),
        invalidInput: input,
        validInput: validInput,
        commands: validCommands,
        showSuggestions: (suggestions) => {
            // debugger;
            suggDiv.empty();
            if (suggestions && suggestions.length > 0) {
                R.forEach((text) => {
                    console.log('adding!', text);
                    addTextParagraph(text, suggDiv);
                }, suggestions);
            }
            
        }
    }
}