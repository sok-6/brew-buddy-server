const TOKEN_AVAILABLE_CHARS = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
const TOKEN_LENGTH = 6;

let activeTokens = [];

let generateSessionToken = () => {
    let newToken;

    do {
        newToken = ""

        while (newToken.length < TOKEN_LENGTH) {
            let nextCharIndex = Math.floor(Math.random() * TOKEN_AVAILABLE_CHARS.length)
            let nextChar = TOKEN_AVAILABLE_CHARS[nextCharIndex]
            newToken += nextChar
        }
    } while (activeTokens.find((e) => e === newToken) !== undefined);

    activeTokens.push(newToken)
    return newToken
}

module.exports = {
    generateSessionToken: generateSessionToken
}