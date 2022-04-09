"use strict";

const suites = {
    'rose': 2,
    'schelle': 1,
    'schilte': 1,
    'eichel': 0,
};

const ranks = {
    'a': 8,
    'k': 7,
    'o': 6,
    'u': 5,
    'b': 4,
    '9': 3,
    '8': 2,
    '7': 1,
    '6': 0,
};

class Card {
    constructor(suite, rank) {
        if (!suites.hasOwnProperty(suite)) {
            throw new Error(`invalid suite "${suite}"`);
        }
        if (!ranks.hasOwnProperty(rank)) {
            throw new Error(`invalid rank "${rank}"`);
        }
        this.suite = suite;
        this.rank = rank;
    }
    name() {
        return `${this.suite}-${this.rank}`;
    }
    imagePath() {
        return `assets/${this.name()}.png`;
    }
    compareTo(other) {
        if (ranks[this.rank] > ranks[other.rank]) {
            return 1;
        } else if (ranks[this.rank] < ranks[other.rank]) {
            return -1;
        } else if (suites[this.suite] > suites[other.suite]) {
            return 1;
        } else if (suites[this.suite] < suites[other.suite]) {
            return -1;
        } else {
            return 0;
        }
    }
}

function createDeck() {
    const deck = new Array();
    for (const suite in suites) {
        for (const rank in ranks) {
            const card = new Card(suite, rank);
            deck.push(card);
        }
    }
    return deck;
}

function randint(n) {
    return Math.floor(Math.random() * n);
}

function shuffle(deck) {
    const indices = new Array();
    for (let i = 0; i < deck.length; i++) {
        indices.push(i);
    }
    const randomIndices = new Array();
    while (indices.length > 0) {
        const at = randint(indices.length);
        randomIndices.push(indices[at]);
        indices.splice(at, 1);
    }
    const shuffledDeck = new Array();
    for (let randomIndex of randomIndices) {
        shuffledDeck.push(deck[randomIndex]);
    }
    return shuffledDeck;
}

function clearChildren(element) {
    while (element.hasChildren()) {
        const child = element.children[0];
        element.removeChild(child);
    }
}

function layCard(card, container) {
    const cardImage = document.createElement("img");
    cardImage.setAttribute("src", card.imagePath());
    cardImage.setAttribute("alt", card.name());
    cardImage.setAttribute("class", "card");
    container.appendChild(cardImage)
}

function pullCard(deck) {
    if (deck.length < 1) {
        throw new Error("Deck is empty.");
    }
    return {
        card: deck[0],
        deck: deck.slice(1),
    }
}

function calcProbabilities(lastCard, remainingDeck) {
    let higherCards = 0;
    let equalCards = 0;
    let lowerCards = 0;
    for (let card of remainingDeck) {
        switch (card.compareTo(lastCard)) {
            case 1:
                higherCards++;
                break;
            case 0:
                equalCards++;
                break
            case -1:
                lowerCards++;
                break
        }
    }
    return [
        {outcome: "P(Higher)", prob: higherCards / remainingDeck.length},
        {outcome: "P(Lower)", prob: lowerCards / remainingDeck.length},
        {outcome: "P(Equal)", prob: equalCards / remainingDeck.length}
    ];
}

function round(value, granularity) {
    const rounded = Math.round((1 / granularity) * value) * granularity;
    return Math.floor(rounded * 100) / 100;
}

document.addEventListener("DOMContentLoaded", () => {
    const stackContainer = document.getElementById("cardstack");
    const balanceInput = document.getElementById("balance");
    const betInput = document.getElementById("bet");
    const higherButton = document.getElementById("higher");
    const lowerButton = document.getElementById("lower");
    const minButton = document.getElementById("minBet");
    const maxButton = document.getElementById("maxBet");
    const messageContainer = document.getElementById("message");
    const cardX = document.getElementById("cardX");
    const cardY = document.getElementById("cardY");

    const notify = (message) => {
        messageContainer.innerHTML = `«${message}»`;
    };

    const updateControls = (balance, nCardsPlayed) => {
        balanceInput.value = balance;
        betInput.setAttribute("max", balance);
        cardX.innerHTML = nCardsPlayed;
    };

    const proposeBet = (probs, balance, granularity) => {
        const {outcome, prob} = probs.reduce(({outcome: maxO, prob: maxP}, {outcome: o, prob: p}) => {
            if (p > maxP) {
                return {outcome: o, prob: p};
            } else {
                return {outcome: maxO, prob: maxP};
            }
        }, {outcome: undefined, prob: 0.0});

        const idealBet = balance * prob;
        const maxIdealBet = Math.min(balance, idealBet);
        const betLinear = round(maxIdealBet, granularity);

        // discount probability quadratically
        const conservativeBet = balance * Math.pow(prob, 2);
        const maxConservativeBet = Math.min(balance, conservativeBet);
        const betSquared = round(maxConservativeBet, granularity);
        return {
            outcome: outcome,
            prob: round(prob, 0.01),
            betLinear: betLinear,
            betSquared: betSquared
        };
    };

    const minBet = Number.parseFloat(betInput.getAttribute("min"));
    const granularity = Number.parseFloat(betInput.getAttribute("step"));

    let deck = shuffle(createDeck());
    let balance = 100.0;
    let defaultBet = 5.0;
    betInput.value = `${defaultBet}`;
    cardY.innerHTML = deck.length;

    let {card: lastCard, deck: newDeck} = pullCard(deck);
    let nCardsPlayed = 1;
    layCard(lastCard, stackContainer);
    updateControls(balance, nCardsPlayed);
    deck = newDeck;

    console.log(proposeBet(calcProbabilities(lastCard, newDeck), balance, granularity));

    // TODO: refactoring
    // - accept last card, remaining deck, bet
    // - return last card, remaining deck, win, maybe message
    // TODO: display
    // - show how many cards have been dealt (e.g. 13/36)
    const makeBet = (decision) => {
        if (deck.length < 1) {
            notify("Huere Lappi! Alle Karten wurden bereits gespielt!");
            return
        }
        const bet = Number.parseFloat(betInput.value);
        if (Number.isNaN(bet)) {
            notify(`Huere Löli! ‹${betInput.value}› ist doch keine Gebot!`);
            return;
        } else if (bet < minBet) {
            notify(`Huere Löli! ‹${bet}› zu bieten ist doch s Bättle versuumet!`);
            return;
        } else if (balance == 0) {
            notify(`Huere Fötzu! Du hast ja alles verspielt!`);
            return;
        } else if (bet > balance) {
            notify(`Huere Plagöri! Du hast ja nur ${balance}!`);
            return;
        }
        let {card: newCard, deck: newDeck} = pullCard(deck);
        layCard(newCard, stackContainer);
        if (newCard.compareTo(lastCard) > 0 && decision === "higher" ||
            newCard.compareTo(lastCard) < 0 && decision === "lower") {
            balance += bet;
            notify(`Huere Glöggliböög! Du gewinnst ${bet}!`);
        } else {
            balance -= bet;
            notify(`Huere Söörmu! Du verlierst ${bet}!`);
        }
        balance = round(balance, granularity);
        deck = newDeck;
        lastCard = newCard;
        updateControls(balance, ++nCardsPlayed);
        if (deck.length == 0) {
            setTimeout(() => {
                notify(`Das Spiel ist vorbei. Du hast ${balance} Stutz gewonnen!`);
            }, 2000);
        } else if (balance == 0) {
            setTimeout(() => {
                notify(`Huere Fötzu! Du hast ja alles verspielt!`);
            }, 2000);
        } else {
            console.log(proposeBet(calcProbabilities(lastCard, newDeck), balance, granularity));
        }
    };

    higherButton.addEventListener("click", (e) => {
        e.preventDefault();
        makeBet("higher");
    });
    lowerButton.addEventListener("click", (e) => {
        e.preventDefault();
        makeBet("lower");
    });

    minButton.addEventListener("click", (e) => {
        e.preventDefault();
        betInput.value = betInput.getAttribute("min");
    });
    maxButton.addEventListener("click", (e) => {
        e.preventDefault();
        betInput.value = balanceInput.value;
    });
});
