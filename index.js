var app = require('express')();
var http = require('http').Server(app);

app.get('/', (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

http.listen(3000, () => {
  console.log('listening on *:3000');
});