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

module.exports = {
    getRandomInt: getRandomInt,
    getRandomElement: getRandomElement
};