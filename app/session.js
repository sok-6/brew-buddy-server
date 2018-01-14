const TOKEN_AVAILABLE_CHARS = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
const TOKEN_LENGTH = 6;

let activeSessions = [];

let getSessionByToken = (sessionToken) => {
    let foundSession = activeSessions.find((e) => e.token === sessionToken);
    return foundSession === undefined ? null : foundSession;
}

let generateSessionToken = () => {
    let newToken;

    do {
        newToken = ""

        while (newToken.length < TOKEN_LENGTH) {
            let nextCharIndex = Math.floor(Math.random() * TOKEN_AVAILABLE_CHARS.length)
            let nextChar = TOKEN_AVAILABLE_CHARS[nextCharIndex]
            newToken += nextChar
        }
    } while (getSessionByToken(newToken) !== null);

    return newToken
}

let generateSession = (hostId, hostName) => {
    let token = generateSessionToken();

    activeSessions.push({ 
        token: token,
        host: {
            id: hostId,
            name: hostName
        },
        clients: []
    });

    return token;
}

let joinSession = (sessionToken, clientId, clientName) => {
    let session = getSessionByToken(sessionToken);

    if (session === null) {
        throw `Could not location active session ${sessionToken}`;
    }

    session.clients.push({
        id: clientId,
        name: clientName
    });
}

module.exports = {
    generateSession: generateSession,
    joinSession: joinSession
}