
import * as Rx from 'rxjs';
import * as R from 'ramda';
import * as $ from 'jquery';

const KEYS = {
    ENTER: 13,
    TAB: 9
};

const isEnter = (evt: any) => evt.which === KEYS.ENTER;

function isTab(evt: any) {
    return evt.which === KEYS.TAB;
}

function addTextParagraph(text: string, el: HTMLElement) {
    // debugger;
    const p = document.createElement('p');
    p.innerHTML = text;
    el.appendChild(p);
}

function initInput(commandInput: HTMLInputElement) {
    commandInput.addEventListener('blur', () => {
        commandInput.focus();
    });

    const tabs$ = Rx.Observable.fromEvent(commandInput, 'keydown')
        .filter(isTab);
        
    tabs$
        .do((evt: any) => evt.preventDefault())
        .subscribe();

    const getValue = () => commandInput.value;

    const inputPressWithEnter$ = Rx.Observable.fromEvent(commandInput, 'keyup')
        .do((evt: any) => {
            // console.log('keypress!', isEnter(evt));
        })
        .filter(() => !!commandInput.value);

    const inputPress$ = inputPressWithEnter$
        .filter((evt) => !isEnter(evt))
        .map(getValue)
        .do((val: string) => {
            // console.log('value!', val);
            fakeInputText.innerText = val;
        });
    inputPress$.subscribe();

    const inputEnter$ = inputPressWithEnter$
        .filter(isEnter)
        .map(getValue)

    

    const fakeInputText = document.getElementById('fakeinputtext') as HTMLElement;

    const valid = (text: string) => !!(text && text[0].match(/[A-Za-z]/)); 
    const inputValidity$ = inputEnter$.map(valid);
    const validInput$ = inputPress$
        .filter(valid);

    const validCommands$ = inputEnter$
        .filter(valid)
        .do((val) => {
            // console.log('hello here', val);
            commandInput.value = '';
        });

    return {
        input$: inputPress$.share(),
        validInput$: validInput$.share(),
        validCommands$: validCommands$.share(),
        tabs$
    };
}

export interface View {
    setValue: (val: string) => void;
    print: (val: string) => void;
    showSuggestions: (suggestions: string[] | undefined) => void;
    onCommand: () => void;
    showError: () => void;
    tabs$: Rx.Observable<any>;
    invalidInput$: Rx.Observable<string>;
    validInput$: Rx.Observable<string>;
    commands$: Rx.Observable<string>;
}

export function createView(): View {
    const commandInput = $('#command');
    const { input$, validInput$, validCommands$, tabs$ } = initInput(
        commandInput[0] as HTMLInputElement
    );
    commandInput.focus();

    const screen = $('#screen');
    const suggDiv = $('#suggestions');

    const print = (text: string) => addTextParagraph(text, screen[0]);
    const showSuggestions = (suggestions: string[] | undefined) => {
        suggDiv.empty();
        if (suggestions && suggestions.length > 0) {
            R.forEach((text: string) => {
                addTextParagraph(text, suggDiv[0]);
            }, suggestions);
        }
    };

    validCommands$.do((cmd: string) => print('> ' + cmd)).subscribe();

    const onCommand = () => {
        screen.scrollTop(screen[0].scrollHeight);
    };

    const setValue = (val: string) => {
        commandInput.val(val);
    };

    let errors = 0;
    const errordiv = $('#errors');
    const showError = () => {
        errors++;
        errordiv.removeClass('empty-errors');
    };

    return {
        setValue,
        print, showSuggestions,
        onCommand, tabs$,
        showError,
        invalidInput$: input$,
        validInput$: validInput$,
        commands$: validCommands$.delay(500),
    };
}
