
import { randomChoice } from '../util/utils';
import { State } from '../data/state';

const NAME_INSULTS = [
    "Really? I guess that's what we're working with.",
    "Uhh, let's come back to that later.",
    "That can't be correct, but let's go with that for now.",
    "A rather stupid name, but that's the one you chose. No point berating yourself about it a second after you come up with it.",
    "You feel a powerful affinity with this newly chosen name.",
    "That sure is your name, as God is my witness.",
    "A fitting choice."
];

export function unknownCommand(): string {
    return "You are startled by a strange thought you just had.";
}

export function nameAsk(): string[] {
    return [
        "You feel dizzy, like you've just woken up from a heavy nap. You can't quite remember your name.",
        "By enormous strain the gears in your meatpan start turning. Yes, your name is..."
    ];
}

export function namePrint(state: State): string[] {
    const insult = randomChoice(NAME_INSULTS);
    return [`Your name is ${state.player.name}. ${insult}`];
}

export function takeEmpty(): string[] {
    return randomChoice([
        ["Take what?"],
        ["Your hands vainly attempt to grab at nothingness."],
        ["You are overcome with the desire to own something, anything at all. You receive the feeling of stupidity in return."],
        ["Filled with a materialistic burning, you grab at empty air for more possessions."]
    ]);
}

export function takeNonExisting(): string[] {
    return randomChoice([
        ["You don't see any of that around for your eager hands to grab."],
        ["Your hands vainly attempt to grab at nothingness."]
    ]);
}
