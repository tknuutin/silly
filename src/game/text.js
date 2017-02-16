
const randomChoice = (arr) => arr[Math.floor(Math.random() * arr.length)];

const NAME_INSULTS = [
    "Really? I guess that's what we're working with.",
    "Uhh, let's come back to that later.",
    "That can't be correct, but let's go with that for now.",
    "A rather stupid name, but that's the one you chose. No point berating yourself about it a second after you come up with it.",
    "You feel a powerful affinity with this newly chosen name.",
    "That sure is your name, as God is my witness."
];

export function unknownCommand() {
    return "You are startled by a strange thought you just had.";
}

export function nameAsk() {
    return [
        "You feel dizzy, like you've just woken up from a heavy nap. You can't quite remember your name.",
        "By enormous strain the gears in your meatpan start turning. Yes, your name is..."
    ];
}

export function namePrint(state) {
    const insult = randomChoice(NAME_INSULTS);
    return [`Your name is ${state.player.name}. ${insult}`];
}