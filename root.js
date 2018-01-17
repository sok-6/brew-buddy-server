var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

const session = require("./app/session");

app.get('/*', function (req, res) {
  res.sendFile(__dirname + '/www/index.html');
});

io.on('connection', function (socket) {
  console.log('connection');

  socket.on("session.new", (data) => {
    console.log("session.new");
    console.log(`- socket id:${socket.id}`);

    // Create new session, get token
    let sessionToken = session.generateSession(socket.id, data.name);
    console.log(`- generated token:${sessionToken}`);

    // Join session room
    socket.join(sessionToken);

    // Send session token to host
    io.to(socket.id).emit("session.new.response", { sessionToken: sessionToken });

    io.to(sessionToken).emit("feed.add.status", { message: `Session created with token ${sessionToken}` });
  });

  socket.on("session.join", (data) => {
    console.log("session.join");
    console.log(`- socket id:${socket.id}, session token:${data.sessionToken}`);

    try {
      var hostName = session.joinSession(data.sessionToken, socket.id, data.name);
      socket.join(data.sessionToken);
      io.to(socket.id).emit("session.join.response", { hostName: hostName });
      io.to(data.sessionToken).emit("feed.add.status", {message:`${data.name} joined the session`});
    } catch (e) {
      console.log(e);
    }
  })

  socket.on("connection.check", (data) => {
    console.log(`connection.check - initiated by ${socket.id}`);
    socket.to(session.getSessionTokenBySocketId(socket.id)).emit("connection.check", { initiatedById: socket.id });
  })

  socket.on('disconnect', function () {
    console.log('disconnect');
    console.log(`- socket id:${socket.id}`);

    let sessionToken = session.getSessionTokenBySocketId(socket.id);
    session.
    io.to(sessionToken).emit("feed.add.status", {message})

    // Remove socket from session, close room if socket was host
    session.handleDisconnection(socket.id, (sessionToken) => {
      socket.to(sessionToken).emit("session.close");
    })
  });
});

http.listen(3000, function () {
  console.log('listening on *:3000');
});