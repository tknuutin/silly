
import * as Bacon from 'baconjs';
import $ from './jqueryp';
import * as BJQ from 'bacon.jquery';
import * as R from 'ramda';

const KEYS = {
    ENTER: 13,
    TAB: 9
}

function submitOnEnter(evt, inputEl) {
    // console.log('which', evt.which)
    if (evt.which == KEYS.ENTER) {
        inputEl.submit();
        return false;
    }
}

function isTab(evt) {
    return evt.which === KEYS.TAB;
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

    const tabs = commandInput.keydownE().filter(isTab);
    tabs.onValue((evt) => {
        evt.preventDefault();
    });

    commandInput.keypressE().onValue((evt) => submitOnEnter(evt, commandInput));

    const input = BJQ.textFieldValue(commandInput);
    const fakeInputText = $('#fakeinputtext');

    input.onValue((val) => {
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
    return { input, validInput, validCommands, tabs };
}

export function createView() {
    const commandInput = $('#command');
    const { input, validInput, validCommands, tabs } = initInput(commandInput);
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

    const onCommand = () => {
        screen.scrollTop(screen[0].scrollHeight);
    }

    const setValue = (val) => {
        commandInput.val(val);
    }

    return {
        setValue,
        print, showSuggestions,
        onCommand, tabs,
        invalidInput: input,
        validInput: validInput,
        commands: validCommands,
    }
}