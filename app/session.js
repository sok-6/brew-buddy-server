const randomElementOf = require("./helpers").getRandomElement;

const TOKEN_AVAILABLE_CHARS = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
const TOKEN_LENGTH = 6;

let activeSessions = [];

class Client {
    constructor(id, name, isHost) {
        this.id = id;
        this.name = name;
        this.isHost = isHost;
    }
}

class Session {
    constructor(token, hostId, hostName) {
        this.token = token;
        this.clients = [];
        this.clients.push(new Client(hostId, hostName, true));
    }

    /**
     * Adds a client to the current session, if they are not already present in the session
     * @param  {} clientId - the id of the client to add
     * @param  {} clientName - the display name of the client to add
     * @param  {} callback=null - a callback to invoke once the client has been added; signature is callback(newClient:Client)
     */
    addClient(clientId, clientName, callback = null) {
        // Check if client id is already in game
        if (this.clients.find((e) => e.id === clientId) !== undefined) {
            throw `Client with id ${clientId} is already present in session`;
        }
        else {
            let newClient = new Client(clientId, clientName, false);
            this.clients.push(newClient);

            if (callback !== null) {
                callback(newClient);
            }
        }

    }

    getClientById(clientId) {
        return this.clients.find((e) => e.id === clientId);
    }

    getHost() {
        return this.clients.find((e) => e.isHost === true);
    }
}

/**
 * Finds a session to which a given client belongs
 * @param  {} clientId The client id to find a session for
 * @returns {} The found session, or undefined if no such session found
 */
let findSessionByClientId = (clientId) => {
    return activeSessions.find((s) => s.clients.find((c) => c.id === clientId) !== undefined);
}

let findSessionByToken = (token) => {
    return activeSessions.find((s) => s.token === token);
}
/**
 * Generates a new session with a unique token, hosted by the specified client
 * @param  {} hostId The id of the host client
 * @param  {} hostName The name of the host client
 * @returns {} The newly created session
 */
let generateSession = (hostId, hostName) => {
    // Check if host is already client in another session
    let existingSession = findSessionByClientId(hostId);
    if (existingSession !== undefined) {
        throw `Cannot create new session for host id ${hostId} as this id is already present in session with token ${existingSession.token}`;
    } else {
        // Host is not already in a session, generate new token
        var token = "";
        do {
            while (token.length < TOKEN_LENGTH) {
                token += randomElementOf(TOKEN_AVAILABLE_CHARS);
            }
        } while (findSessionByToken(token) !== undefined);

        // Add session with new token and host
        let newSession = new Session(token, hostId, hostName);
        activeSessions.push(newSession);

        return newSession;
    }
}

/**
 * Adds a specific client id and name to an existing session
 * @param  {} token the token of the existing session
 * @param  {} clientId the id of the client to add to the session
 * @param  {} clientName the name of the client to add to the session
 * @returns {} The session the client was added to
 */
let joinSession = (token, clientId, clientName) => {
    // Check if client is already in another session
    let existingSession = findSessionByClientId(clientId);
    if (existingSession !== undefined) {
        throw `Cannot create new session for client id ${clientId} as this id is already present in session with token ${existingSession.token}`;
    } else {
        // Check if token exists
        existingSession = findSessionByToken(token);
        if (existingSession === undefined) {
            throw `Cannot find session with token ${token}`;
        } else {
            existingSession.addClient(clientId, clientName);
            return existingSession
        }
    }
}
/**
 * Handles the disconnection of a given client. If the client is a host, the session will be removed from the active sessions list
 * @param  {} clientId The id of the client who has disconnected
 * @param  {} hostCallback The callback to invoke if the client was the host of a session; signature is callback(session)
 * @param  {} clientCallback The callbackto invoke if the client was not the host of a session; signature is callback(session)
 */
let handleDisconnection = (clientId, hostCallback, clientCallback) => {
    // Get the session the client belongs to
    let session = findSessionByClientId(clientId);
    if (session === undefined) {
        throw `Client id ${clientId} not found in any sessions`;
    } else {
        let client = session.getClientById(clientId);
        if (client.isHost) {
            hostCallback(session);
        } else {
            clientCallback(session);
        }
        
        let sessionIndex = activeSessions.findIndex((s) => s.token === session.token);
        activeSessions.splice(sessionIndex, 1);
    }
}

module.exports = {
    generateSession: generateSession,
    joinSession: joinSession,
    handleDisconnection: handleDisconnection,
    findSessionByClientId: findSessionByClientId
}