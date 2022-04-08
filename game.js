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
        } else if (suites[this.suite] > suites[other.suite]) {
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

document.addEventListener("DOMContentLoaded", () => {
    const stackContainer = document.getElementById("cardstack");
    const balanceInput = document.getElementById("balance");
    const betInput = document.getElementById("bet");
    const higherButton = document.getElementById("higher");
    const lowerButton = document.getElementById("lower");
    const messageContainer = document.getElementById("message");

    const notify = (message) => {
        messageContainer.innerHTML = `«${message}»`;
    };

    const updateControls = (balance) => {
        balanceInput.value = balance;
        betInput.setAttribute("max", balance);
    };

    let deck = shuffle(createDeck());
    let balance = 100.0;
    let defaultBet = 5.0;
    betInput.value = `${defaultBet}`;
    updateControls(balance);

    let {card: lastCard, deck: newDeck} = pullCard(deck);
    layCard(lastCard, stackContainer);
    deck = newDeck;

    const makeBet = (decision) => {
        if (deck.length < 1) {
            notify("Huere Lappi! Alle Karten wurden bereits gespielt!");
            return
        }
        const bet = Number.parseInt(betInput.value);
        if (Number.isNaN(bet)) {
            notify(`Huere Löli! ‹${betInput.value}› ist doch keine Gebot!`);
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
        deck = newDeck;
        lastCard = newCard;
        updateControls(balance);
        if (deck.length == 0) {
            notify(`Das Spiel ist vorbei. Du hast ${balance} Stutz gewonnen!`);
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
});
