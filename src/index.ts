
import './index.css';
import * as R from 'ramda';
import * as Rx from 'rxjs';

import { createView, View } from './app/views/view';
import { get, getStartState } from './app/game/world';
import { nextState } from './app/game/game';
import { State } from './app/game/state';

import { Command } from './app/types/command';

const updateState = (initialState: State) => {
    // Sort of a mutable state hack
    let currentState = initialState;

    const setState = (state: State) => {
        currentState = state;
        (window as any)._state = state;  // For debug
    };

    (window as any)._stateToJson = () => JSON.stringify(currentState);

    return (cmd: string): Rx.Observable<State> =>
        Rx.Observable.fromPromise<State>(
            nextState(currentState, cmd).then((state: State) => {
                setState(state);
                return state;
            })
        );
    
};

const trigger = R.prop('trigger');

interface MatchingCommandPar {
    builtins: Command[];
    areaCmds: Command[];
}

function getMatchingCommands({ builtins, areaCmds }: MatchingCommandPar, inputCmd: string) {
    if (!inputCmd || inputCmd.length < 2) {
        return [];
    }

    const testCmd = inputCmd.length === 2 ? inputCmd + ' ' : inputCmd;
    const findMatches = R.reduce((acc: string[], cmd: Command) => {
        const triggers = [cmd.trigger].concat(cmd.alias || []);
        const newMatches = R.filter((trigger) => trigger.indexOf(testCmd) === 0, triggers);
        return acc.concat(newMatches);
    }, []);

    const matchingAreaCommands = findMatches(areaCmds);
    const matchingSuggestions = findMatches(builtins);

    return matchingAreaCommands.concat(matchingSuggestions);
}

function initSuggestions(view: View, state$: Rx.Observable<State>) {
    const gameInitialized = (state: State) => state.game.initialized;

    const suggestionInfo$ = state$
        .filter(gameInitialized)
        .map((state: State) => state.suggestions);

    const matchingSuggestions$ = view.validInput$
        .withLatestFrom(suggestionInfo$, (input, suggs) => {
            return getMatchingCommands(suggs, input);
        })
        .do((sugg) => {
            view.showSuggestions(sugg);
        });

    matchingSuggestions$.subscribe();
}

function initStateHandling(initialState: State, view: View): Rx.Observable<State> {
    const cmd$ = view.commands$;

    const state$ = Rx.Observable.of([null])
        .merge(cmd$)
        .flatMap(updateState(initialState))
        .catch((e: any, c: any) => {
            console.error(e);
            view.showError();
            return c;
        })
        .do((state: State) => {
            R.forEach(view.print, state.output);
            view.onCommand();
        })
        .share() as Rx.Observable<State>;

    return state$;
}

function start() {
    getStartState().then((state) => {
        const view = createView();
        const state$ = initStateHandling(state, view);
        state$.subscribe();
        // const areaCommands = getAreaCommands(state$);
        const suggestions = initSuggestions(view, state$);
    });
}

window.onload = start;

