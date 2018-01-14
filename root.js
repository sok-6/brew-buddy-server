var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

const session = require("./app/session");

app.get('/*', function(req, res){
  res.sendFile(__dirname + '/www/index.html');
});

// app.get('/:sessionToken', (req, res) => {
//   console.log(req.params.sessionToken);
//   res.sendFile(__dirname + '/www/index.html');
// });

io.on('connection', function(socket){
  console.log('a user connected');

  socket.on("session new", (data) => {
    console.log(data.clientId);
    console.log(session.generateSessionToken());
  })

  socket.on("session join", (data) => {
    console.log(data.clientId);
    console.log(data.sessionToken);
  })

  socket.on('chat message', function(msg){
    console.log('message: ' + msg);
    io.emit('chat message', msg);
    
  });
  socket.on('disconnect', function(){
    console.log('user disconnected');
  });
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});