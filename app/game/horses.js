const rnd = require("../helpers").getRandomInt;

const MAX_STEPS = 20;
const MS_PER_STEP = 250;
const MIN_STEPS_PER_UPDATE = 1;
const MAX_STEPS_PER_UPDATE = 3;
const MIN_MS_PER_UPDATE = 1000;
const MAX_MS_PER_UPDATE = 3000;

let values = {};

let getRandomUpdateTimeout = () => {
    return rnd(MIN_MS_PER_UPDATE, MAX_MS_PER_UPDATE);
};

let processUpdate = (playerName, sendMessage) => {
    let currentSteps = values[playerName];
    let maxStepsPossible = Math.min(MAX_STEPS - currentSteps, MAX_STEPS_PER_UPDATE);

    let updateSteps = rnd(MIN_STEPS_PER_UPDATE, maxStepsPossible + 1);

    values[playerName] += updateSteps;

    sendMessage("game.update", {
        player: playerName,
        updateSteps: updateSteps
    });

    if (values[playerName] < MAX_STEPS) {
        setTimeout(() => {
            processUpdate(playerName, sendMessage);
        }, getRandomUpdateTimeout());
    }
}

module.exports = (participants, sendMessage) => {
    sendMessage("game.initialise", { 
        type:"horses",
        participants: participants, 
        maxSteps: MAX_STEPS,
        msPerStep: MS_PER_STEP
    });

    setTimeout(() => {
        sendMessage("game.start", {

        });

        participants.forEach(playerName => {
            values[playerName] = 0;

            setTimeout(() => {
                processUpdate(playerName, sendMessage);
            }, getRandomUpdateTimeout());
        });
    }, 1000);
    
}