
import * as Bacon from 'baconjs';
import $ from './jqueryp';
import * as BJQ from 'bacon.jquery';
import { createView } from './view';
import * as R from 'ramda';
import * as Network from './network'

// function describeRoom(room) {
//     view.
// }


function getMatchingCommands(areaCommands) {
    return (inputCmd) => {
        if (!inputCmd) {
            return [];
        }

        const filtered = R.filter(({ cmd }) => {
            console.log('shit', cmd)
            return cmd.indexOf(inputCmd) === 0;
        }, areaCommands);
        // debugger;

        return R.map(R.prop('cmd'), filtered);
    };
    

    // return R.pipe(
    //     ,
    //     R.map((cmd) => {
    //         console.log('fuck', cmd)
    //     })
    // );
}


function startGame(state, view) {
    view.print('Starting game!');
    view.commands.onValue(view.print);


    const areaCommands = state.area.commands;
    const matchingCommands = getMatchingCommands(areaCommands);

    const notEmpty = (list) => list.length > 0;
    const suggestions = view.validInput.map(matchingCommands);
    suggestions.log();
    suggestions.onValue(view.showSuggestions);
    view.invalidInput.onValue(() => view.showSuggestions(null));
}



function start() {
    const startDataResponse = Network.getStartData().onValue((data) => {
        startGame(data, createView());
    });
}

window.onload = start;

