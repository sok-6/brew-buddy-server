const fs = require("fs");
const path = require("path");
const dateformat = require("dateformat");

const LOG_DIRECTORY = path.join(path.dirname(require.main.filename), "logs");
const FILE_NOT_EXISTS_CODE = -4058;
const DIR_ALREADY_EXISTS_CODE = -4075;

var logQueue = [];

let processLogQueue = () => {

    while (logQueue.length > 0) {
        let element = logQueue.shift();
        let formattedMessage = `${dateformat(element.loggedAt, "yyyy-mm-dd HH:MM:ss.l")}: [${element.level.toUpperCase()}] ${element.source} - ${element.message}`;

        console.log(formattedMessage);

        let logFilePath = path.join(LOG_DIRECTORY, `${dateformat(element.loggedAt, "yyyymmdd")}.log`);
        try {
            fs.appendFileSync(logFilePath, formattedMessage + "\n");
        } catch (ex) {
            if(ex.errno === FILE_NOT_EXISTS_CODE) {
                fs.writeFileSync(logFilePath, formattedMessage + "\n", {flag: "w"});
            } else {
                throw ex;
            }
        }
    }
}

let logMessage = (level, source, message) => {
    logQueue.push({
        loggedAt: Date.now(),
        level: level,
        source: source,
        message: message
    });

    setImmediate(processLogQueue);
}

let createLogger = (sourceName) => {
    // Create the log folder if it doesn't exist
    try {
        fs.mkdirSync(LOG_DIRECTORY);
    } catch (ex) {
        // Ignore error if file already exists
        if (ex.errno !== DIR_ALREADY_EXISTS_CODE) {
            throw ex;
        }
    }

    return {
        log: (level, message) => logMessage(level, sourceName, message),
        trace: (message) => logMessage("trace", sourceName, message),
        debug: (message) => logMessage("debug", sourceName, message),
        info: (message) => logMessage("info", sourceName, message),
        warn: (message) => logMessage("warn", sourceName, message),
        error: (message) => logMessage("error", sourceName, message)
    }
}

module.exports = createLogger;