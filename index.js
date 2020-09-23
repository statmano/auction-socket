// Setup basic express server
var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var port = process.env.PORT || 3000;

server.listen(port, function () {
  console.log('Server listening at port %d', port);
});

// Routing
app.use(express.static('public'));

// Chatroom

var numUsers = 0;

io.on('connection', function (socket) {
  var addedUser = false;

  // when the client emits 'new message', this listens and executes
  socket.on('new message', function (data) {
    // we tell the client to execute 'new message'
    socket.broadcast.emit('new message', {
      username: socket.username,
      message: data
    });
  });
  
  socket.on('bidC', (data) => {
    socket.bankroll = socket.bankroll + data;
    let upData = {bankRoll: socket.bankroll, userName: socket.username};
    io.emit('bidC2', upData);
  });
  
  let listColors = [['red', 'white'],['blue', 'white'],['white', 'black'],['yellow', 'black'],['green', 'white'],['black', 'gold'],['orange', 'black'],['pink', 'black'],['cyan', 'black'],['purple', 'white'],['gray', 'red'],['LawnGreen', 'black'],['brown', 'white'],['maroon', 'yellow'],['khaki', 'black'],['LightBlue', 'red'],['navy', 'white'],['green', 'yellow'],['blue', 'red'],['fuchsia', 'yellow'],['green', 'white'],['plum', 'navy']];
  
  socket.on('loadList', (data) => {
    var horseButtons = "";
    for (var j = 0; j < data; j++){
     horseButtons += "<button class='list_button' id='b" + (j+1) + "' style='background-color: " + listColors[j][0] + "; color: " + listColors[j][1] + ";'> " + (j+1) + " </button>"; 
     };
    io.emit('listUpdate', horseButtons);
  })

  // when the client emits 'add user', this listens and executes
  socket.on('add user', function (username) {
    if (addedUser) return;

    // we store the username in the socket session for this client
    socket.username = username;
    socket.bankroll = 100;
    ++numUsers;
    addedUser = true;
    socket.emit('login', {
      numUsers: numUsers
    });
    // echo globally (all clients) that a person has connected
    socket.broadcast.emit('user joined', {
      username: socket.username,
      numUsers: numUsers,
      bankroll: socket.bankroll
    });
  });

  // when the client emits 'typing', we broadcast it to others
  socket.on('typing', function () {
    socket.broadcast.emit('typing', {
      username: socket.username
    });
  });

  // when the client emits 'stop typing', we broadcast it to others
  socket.on('stop typing', function () {
    socket.broadcast.emit('stop typing', {
      username: socket.username
    });
  });

  // when the user disconnects.. perform this
  socket.on('disconnect', function () {
    if (addedUser) {
      --numUsers;

      // echo globally that this client has left
      socket.broadcast.emit('user left', {
        username: socket.username,
        numUsers: numUsers
      });
    }
  });
});