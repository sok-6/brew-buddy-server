const helpers = require("../helpers");

const MS_BEFORE_START = 3000;
const MAX_STEPS = 20;
const MS_PER_STEP = 150;
const MIN_STEPS_PER_UPDATE = 1;
const MAX_STEPS_PER_UPDATE = 3;
const MIN_MS_PER_UPDATE = 450;
const MAX_MS_PER_UPDATE = 2000;

const logger = require("../logFactory")("horses");

let getRandomUpdateTimeout = () => {
    return helpers.getRandomInt(MIN_MS_PER_UPDATE, MAX_MS_PER_UPDATE);
};

let initialiseGame = (session, sendMessage) => {
    let participants = helpers.shuffle(session.clients.map((c) => c.name));

    

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
            session.gameData[playerName] = 0;

            let t = getRandomUpdateTimeout();
            logger.debug(`Initial for ${playerName}, delay ${t}`);

            setTimeout(processUpdate, t, session, playerName, sendMessage);
        });
    }, MS_BEFORE_START);
}

let processUpdate = (session, playerName, sendMessage) => {
    logger.debug(`${playerName}: gameData:${JSON.stringify(session.gameData)}`);
    // Check if this is last horse
    let unfinishedPlayerCount = 0;
    for (const player in session.gameData) {
        if (session.gameData.hasOwnProperty(player)) {
            if (session.gameData[player] < 20) {
                unfinishedPlayerCount++;
            }            
        }
    }
    
    logger.debug(`${playerName}: unfinishedPlayerCount:${unfinishedPlayerCount}`);
    if (unfinishedPlayerCount < 2) {
        return;
    }

    let currentSteps = session.gameData[playerName];
    let maxStepsPossible = Math.min(MAX_STEPS - currentSteps, MAX_STEPS_PER_UPDATE);

    let updateSteps = helpers.getRandomInt(MIN_STEPS_PER_UPDATE, maxStepsPossible + 1);

    session.gameData[playerName] += updateSteps;

    logger.debug(`${playerName} updated ${updateSteps} to ${session.gameData[playerName]}`);

    sendMessage("game.update", {
        player: playerName,
        updateSteps: updateSteps
    });

    if (session.gameData[playerName] < MAX_STEPS) {
        let t = getRandomUpdateTimeout();
        logger.debug(`${playerName} timeout ${t} ms`);
        
        setTimeout(processUpdate, t, session, playerName, sendMessage);
    }
}

module.exports = initialiseGame;