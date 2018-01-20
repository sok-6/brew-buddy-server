const express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

const path = require("path")

const sessionManager = require("./app/session");
const startHorses = require("./app/game/horses");

// TODO: Remove manual routing, need to figure out express.js
app.get("/*", (req, res) => {
  if (req.path.startsWith("/static/")) {
    let x = req.path.substring(7);
    res.sendFile(path.join(__dirname, "www", x));
  } else if (req.path === "/plugins.js") {

  } else {
    res.sendFile(path.join(__dirname, "www/index.html"));
  }
});

app.use("/static", express.static("www"));

io.on('connection', function (socket) {
  console.log('connection');

  socket.on("session.new", (data) => {
    console.log("session.new");
    console.log(`- socket id:${socket.id}`);

    // Create new session, get token
    let newSession = sessionManager.generateSession(socket.id, data.name);
    console.log(`- generated token:${newSession.token}`);

    // Join session room
    socket.join(newSession.token);

    // Send session token to host
    io.to(socket.id).emit("session.new.response", { sessionToken: newSession.token });

    io.to(newSession.token).emit("feed.add.status", { message: `Session created with token ${newSession.token}` });
  });

  socket.on("session.join", (data) => {
    console.log("session.join");
    console.log(`- socket id:${socket.id}, session token:${data.sessionToken}`);

    try {
      var session = sessionManager.joinSession(data.sessionToken, socket.id, data.name);
      socket.join(session.token);
      io.to(socket.id).emit("session.join.response", { hostName: session.getHost().name });
      io.to(data.sessionToken).emit("feed.add.status", { message: `${data.name} joined the session` });
    } catch (e) {
      console.log(e);
    }
  })

  socket.on("connection.check", (data) => {
    console.log(`connection.check - initiated by ${socket.id}`);
    socket.to(sessionManager.findSessionByClientId(socket.id).token).emit("connection.check", { initiatedById: socket.id });
  })

  socket.on('disconnect', function () {
    console.log('disconnect');
    console.log(`- socket id:${socket.id}`);

    let foundSession = sessionManager.findSessionByClientId(socket.id);
    if (foundSession === undefined) {
      console.log(`- Could not find session for socket id ${socket.id}`);
      return;
    }

    let disconnectedClientName = foundSession.getClientById(socket.id);
    io.to(foundSession.token).emit("feed.add.status", { message: `${disconnectedClientName.name} disconnected` });

    // Remove socket from session, close room if socket was host
    sessionManager.handleDisconnection(socket.id, (session) => {
      // Force all connected clients to disconnect
      socket.to(session.token).emit("session.close");
    }, (session) => {
      // No action required
    });
  });

  socket.on("chat.send", (data) => {
    // Get the session to send the chat message to
    let session = sessionManager.findSessionByClientId(socket.id);
    let client = session.getClientById(socket.id);

    io.to(session.token).emit("feed.add.chat", {
      senderName: client.name,
      senderIsHost: client.isHost,
      message: data.message
    });
  })

  socket.on("game.start", (data) => {
    console.log("game.start");

    let session = sessionManager.findSessionByClientId(socket.id);
    if (session.getHost().id !== socket.id) {
      console.log(`- Start game initiated by ${socket.id} but not host of game`);
    } else {
      let participants = session.clients.map((c) => c.name);
      let sendMessage = (message, data) => { io.to(session.token).emit(message, data) };

      switch (data.gameType) {
        case "horses":
          startHorses(participants, sendMessage);
          break;

        default:
          break;
      }
    }
  })
});

http.listen(3000, function () {
  console.log('listening on *:3000');
});