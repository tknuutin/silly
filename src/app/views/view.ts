
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

function initInput(commandInput: HTMLInputElement, fakeInput$: Rx.Observable<string>) {
    const fakeInputText = document.getElementById('fakeinputtext') as HTMLElement;

    commandInput.addEventListener('blur', () => {
        commandInput.focus();
    });

    const tabs$ = Rx.Observable.fromEvent(commandInput, 'keydown')
        .filter(isTab)
        .do((evt: any) => evt.preventDefault());
        
    const getValue = () => commandInput.value;

    const inputPressWithEnter$ = Rx.Observable.fromEvent(commandInput, 'keyup');

    const inputPress$ = inputPressWithEnter$
        .filter((evt) => !isEnter(evt))
        .map(getValue)
        .merge(
            fakeInput$.do((val) => {
                commandInput.value = val;
            })
        )
        .do((val: string) => {
            fakeInputText.innerText = val;
        });
    inputPress$.subscribe();

    const inputEnter$ = inputPressWithEnter$
        .filter(isEnter)
        .map(getValue);    

    const valid = (text: string) => !!(text && text[0].match(/[A-Za-z]/)); 
    const inputValidity$ = inputEnter$.map(valid);
    const validInput$ = inputPress$
        .filter(valid);

    const validCommands$ = inputEnter$
        .filter(valid)
        .do((val) => {
            fakeInputText.innerHTML = '';
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

type Suggestions = string[] | undefined;

function createErrorsView() {
    // This is bugged??
    let errors = 0;
    const errordiv = $('#errors');
    const showError = () => {
        errors++;
        errordiv.removeClass('empty-errors');
    };
    return showError;
}

// I dunno
function makeSubject<T>(): { setNext: (val: T) => void, stream$: Rx.Observable<T> } {
    const proxy: { setter: ((val: T) => void) | undefined } = {
        setter: undefined
    };

    const setNext = (val: T): void => {
        if (proxy.setter) {
            proxy.setter(val);
        }
    };

    const stream$: Rx.Observable<T> = Rx.Observable.create((obs: any) => {
        proxy.setter = (val: T) => {
            obs.next(val);
        };
    });


    return { setNext, stream$ };
}

function createSuggestionsView(tabs$: Rx.Observable<any>, setValue: (val: string) => void) {
    const suggDiv = $('#suggestions');

    const suggSubject = makeSubject<Suggestions>();

    const sugg$ = suggSubject.stream$
        .share()
        .do((suggs: string[] | undefined) => {
            suggDiv.empty();
            if (suggs && suggs.length > 0) {
                R.forEach((text: string) => {
                    addTextParagraph(text, suggDiv[0]);
                }, suggs);
            }
        });

    const tabWithSugg$ = tabs$.withLatestFrom(sugg$, (tab, sugg) => sugg)
        .filter((sugg) => !!sugg)
        .do((sugg: string[]) => {
            const val = sugg[0];
            setValue(val);
        });

    tabWithSugg$.subscribe();


    return suggSubject.setNext;
}

function createFakeInput() {
    const fakeInputSubject = makeSubject<string>();
    
    return {
        setValue: fakeInputSubject.setNext,
        fakeInput$: fakeInputSubject.stream$
    };
}

export function createView(): View {
    const commandInput = $('#command');

    const { setValue, fakeInput$ } = createFakeInput();

    const { input$, validInput$, validCommands$, tabs$ } = initInput(
        commandInput[0] as HTMLInputElement,
        fakeInput$
    );
    commandInput.focus();

    const screen = $('#screen');
    
    const showSuggestions = createSuggestionsView(tabs$, setValue);

    const print = (text: string) => addTextParagraph(text, screen[0]);

    validCommands$.do((cmd: string) => print('> ' + cmd)).subscribe();

    const onCommand = () => {
        screen.scrollTop(screen[0].scrollHeight);
    };

    const showError = createErrorsView();
    

    return {
        setValue,
        print, showSuggestions,
        onCommand, tabs$,
        showError,
        invalidInput$: input$,
        validInput$: validInput$,
        commands$: validCommands$.delay(100),
    };
}
