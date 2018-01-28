/**
 * Gets a random integer, x, where min <= x < max
 * @param  {} min - Inclusive minimum for output
 * @param  {} max - Exclusive maximum for output
 */
let getRandomInt = (min, max) => {
    return Math.floor(Math.random() * (max - min)) + min;
}

let getRandomElement = (seq) => {
    return seq[getRandomInt(0, seq.length)];
}

let shuffle = (array) => {
    var currentIndex = array.length, temporaryValue, randomIndex;

    // While there remain elements to shuffle...
    while (0 !== currentIndex) {

        // Pick a remaining element...
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;

        // And swap it with the current element.
        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
    }

    return array;
}

module.exports = {
    getRandomInt: getRandomInt,
    getRandomElement: getRandomElement,
    shuffle: shuffle
};