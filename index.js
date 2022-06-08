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
var usersList = [];
var idsList = [];
var bidList = {};
var userBankrolls = [];
var enteredList = [];
var usedList = [];
var removeNum;
var indexRem;

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
  
  
  // Take in the number of horses entered and puts into array, sets user bankrolls, removes remaining numbers
  socket.on('loadList', (data) => {
    removeNum = data;
    userBankrolls = [100, 100];
    enteredList = [];
    for (var i = 0; i < removeNum; i++){
      enteredList[i] = i+1;
    }
    io.emit('removeHorses', {
      removeNum: removeNum,
      usernumber: socket.usernumber,
      thatarray: enteredList
    });
  });
  
  socket.on('currentnom', (data) => {
    // First we take out the nominated horse from the unusedList array above
    let dataV = parseInt(data);
    indexRem = enteredList.indexOf(dataV);
       enteredList.splice(indexRem, 1);
    // Then we send the nominated horses number (value) to all sockets
    let dataUp = data;
    io.emit('nommove', {dataUp: dataUp, thatarray: enteredList});
  });
  
  // This is done when both users are logged in
  socket.on('stable', (data) => {
    let userOne = usersList[0];
    let userTwo = usersList[1];
    io.emit('stableUpdate', {
      userOne: userOne,
      userTwo: userTwo,
      bankrollOne: userBankrolls[0],
      bankrollTwo: userBankrolls[1]
    });
  });
  
  socket.on('placed_bid', (data) =>{
    socket.bid = data;
    var bankrollTest;
    if (socket.usernumber == "u1"){
      bankrollTest = userBankrolls[0];
      idsList[0] = socket.id;
    } else {
      bankrollTest = userBankrolls[1];
      idsList[1] = socket.id;
    }
    // Make sure user has enough in their bankroll to cover the bid
    if(socket.bid > bankrollTest){
      socket.emit('invalid_bid',{msg: "Your bid is too high, please resubmit a lower bid there guy."})
    } else {
      var isMyObjectEmpty = !Object.keys(bidList).length;
      if (isMyObjectEmpty){
        bidList[socket.usernumber] = socket.bid;
      } else {
        bidList[socket.usernumber] = socket.bid;
        var bid1 = parseInt(bidList.u1);
        var bid2 = parseInt(bidList.u2);
        if (bid1 > bid2){
          userBankrolls[0] = userBankrolls[0] - bid1;
          io.emit('test_bid',{
            user: usersList[0],
            msg: " had the winning bid at $",
            msg2: " please nominate a new horse",
            win: bid1,
            stable: "One",
            updatedBankroll: userBankrolls[0]
          });
          bidList = {};
          if (userBankrolls[0] < 1){
            io.to(idsList[0]).emit('no_mas', {nomas: true});
            io.emit('leftovers', {
              user: "Two",
              arr: enteredList
              }
            );
          }
        } else if (bid2 > bid1){
          userBankrolls[1] = userBankrolls[1] - bid2;
          io.emit('test_bid',{
            user: usersList[1],
            msg: " had the winning bid at $",
            msg2: " please nominate a new horse",
            win: bid2,
            stable: "Two",
            updatedBankroll: userBankrolls[1]
          });
          bidList = {};
          if (userBankrolls[1] < 1){
            io.to(idsList[1]).emit('no_mas', {nomas: true});
            io.emit('leftovers', {
              user: "One",
              arr: enteredList
              }
              );
          }
        } else {
        io.emit('tie_bid',{
          msg: "Uh oh, we had a tie! Please submit a new bid. It could be a different bid, it could be the same bid."
          });
          bidList = {};
        }
      }
    }  
    /* if (socket.bid < socket.bankroll){
      io.emit('test_bid',{
        phil: "Collins"
      })
    }
  } */ 
  });
  // when the client emits 'add user', this listens and executes
  socket.on('add user', function (username) {
    if (addedUser) return;

    // we store the username in the socket session for this client
    socket.username = username;
    socket.bankroll = 100;
    socket.stable = [];
    userBankrolls.push(socket.bankroll);
    ++numUsers;
    usersList.push(socket.username);
    socket.usernumber = "u" + numUsers;
    addedUser = true;
    socket.emit('login', {
      numUsers: numUsers,
      usernumber: socket.usernumber,
      username: socket.username,
      bankroll: socket.bankroll
    });
    // echo globally (all clients) that a person has connected
    socket.broadcast.emit('user joined', {
      username: socket.username,
      numUsers: numUsers,
      bankroll: socket.bankroll,
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
      usersList = [];

      // echo globally that this client has left
      socket.broadcast.emit('user left', {
        username: socket.username,
        numUsers: numUsers
      });
    }
  });
});