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
    '6': 0
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

document.addEventListener("DOMContentLoaded", () => {
    const deck = createDeck();
    const shuffledDeck = shuffle(deck);
    const minOverlap = 135;
    const maxOverlap = 150;
    const overlapRange = maxOverlap - minOverlap;
    const overlapPerCard = overlapRange / deck.length;
    for (const i in shuffledDeck) {
        const card = shuffledDeck[i];
        const stackContainer = document.getElementById("cardstack");
        const cardImage = document.createElement("img");
        cardImage.setAttribute("src", card.imagePath());
        cardImage.setAttribute("alt", card.name());
        cardImage.setAttribute("class", "card");
        const age = deck.length - i;
        const overlap = minOverlap + overlapPerCard * age;
        if (i > 0) {
            cardImage.setAttribute("style", `margin-left: -${overlap}px;`);
        }
        stackContainer.appendChild(cardImage)
    }
});
