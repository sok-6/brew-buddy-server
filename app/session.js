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

    return session
}

let getSessionBySocketId = (socketId) => {
    for (let i = 0; i < activeSessions.length; i++) {
        const session = activeSessions[i];
        if (session.host.id === socketId) {
            return session;
        }
        else {
            for (let x = 0; x < session.clients.length; x++) {
                const client = session.clients[x];
                if (client.id === socketId) {
                    return session;
                }
            }
        }
    }

    return null;
}

let getSessionTokenBySocketId = (socketId) => {
    return getSessionBySocketId(socketId).token;
}

let handleDisconnection = (socketId, closeRoom) => {
    for (let i = 0; i < activeSessions.length; i++) {
        const session = activeSessions[i];
        if (session.host.id === socketId) {
            // Host disconnected, send remote close to room
            closeRoom(session.token);
            return;
        }
        else {
            for (let x = 0; x < session.clients.length; x++) {
                const client = session.clients[x];
                if (client.id === socketId) {
                    session.clients.splice(x, 1);
                    return;
                }
            }
        }
    }
}

module.exports = {
    generateSession: generateSession,
    joinSession: joinSession,
    handleDisconnection: handleDisconnection,
    getSessionTokenBySocketId: getSessionTokenBySocketId
}