const rnd = require("../helpers").getRandomInt;

const MAX_STEPS = 20;
const MS_PER_STEP = 150;
const MIN_STEPS_PER_UPDATE = 1;
const MAX_STEPS_PER_UPDATE = 3;
const MIN_MS_PER_UPDATE = 450;
const MAX_MS_PER_UPDATE = 2000;

const logger = require("../logFactory")("horses");

let values = {};

let getRandomUpdateTimeout = () => {
    return rnd(MIN_MS_PER_UPDATE, MAX_MS_PER_UPDATE);
};

let processUpdate = (playerName, sendMessage) => {
    let currentSteps = values[playerName];
    let maxStepsPossible = Math.min(MAX_STEPS - currentSteps, MAX_STEPS_PER_UPDATE);

    let updateSteps = rnd(MIN_STEPS_PER_UPDATE, maxStepsPossible + 1);

    values[playerName] += updateSteps;

    logger.debug(`${playerName} updated ${updateSteps} to ${values[playerName]}`);

    sendMessage("game.update", {
        player: playerName,
        updateSteps: updateSteps
    });

    if (values[playerName] < MAX_STEPS) {
        let t = getRandomUpdateTimeout();
        logger.debug(`${playerName} timeout ${t} ms`);
        
        setTimeout(processUpdate, t, playerName, sendMessage);
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

            let t = getRandomUpdateTimeout();
            logger.debug(`Initial for ${playerName}, delay ${t}`);

            setTimeout(processUpdate, t, playerName, sendMessage);
        });
    }, 1000);
    
}