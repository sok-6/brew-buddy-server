var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

const session = require("./app/session");

app.get('/*', function (req, res) {
  res.sendFile(__dirname + '/www/index.html');
});

// app.get('/:sessionToken', (req, res) => {
//   console.log(req.params.sessionToken);
//   res.sendFile(__dirname + '/www/index.html');
// });

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
  });

  socket.on("session.join", (data) => {
    console.log("session.join");
    console.log(`- socket id:${socket.id}, session token:${data.sessionToken}`);

    try {
      session.joinSession(data.sessionToken, socket.id, data.name);
    } catch(e) {
      console.log(e);
    }
  })

  socket.on("session.join", (data) => {
    console.log(socket.id);
    console.log(data.sessionToken);
  })

  socket.on('disconnect', function () {
    console.log('disconnect');
  });
});

http.listen(3000, function () {
  console.log('listening on *:3000');
});