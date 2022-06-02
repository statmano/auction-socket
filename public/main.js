

/* global io */

$(function() {
  var FADE_TIME = 150; // ms
  var TYPING_TIMER_LENGTH = 400; // ms
  var COLORS = [
    '#e21400', '#91580f', '#f8a700', '#f78b00',
    '#58dc00', '#287b00', '#a8f07a', '#4ae8c4',
    '#3b88eb', '#3824aa', '#a700ff', '#d300e7'
  ];

  // Initialize variables
  var $window = $(window);
  var $usernameInput = $('.usernameInput'); // Input for username
  var $messages = $('.messages'); // Messages area
  var $inputMessage = $('.inputMessage'); // Input message input box

  var $loginPage = $('.login.page'); // The login page
  var $chatPage = $('.chat.page'); // The chatroom page

  // Prompt for setting a username
  var username;
  var connected = false;
  var typing = false;
  var lastTypingTime;
  var $currentInput = $usernameInput.focus();

  var socket = io();

  function addParticipantsMessage (data) {
    var message = '';
    if (data.numUsers === 1) {
      message += "there's 1 participant";
    } else {
      message += "there are " + data.numUsers + " participants";
    }
    log(message);
  }

  // Sets the client's username
  function setUsername () {
    username = cleanInput($usernameInput.val().trim());

    // If the username is valid
    if (username) {
      $loginPage.fadeOut();
      $chatPage.show();
      $loginPage.off('click');
      //$currentInput = $inputMessage.focus();

      // Tell the server your username
      socket.emit('add user', username);
    }
  }

  
  
  // Sends a chat message
  function sendMessage () {
    var message = $inputMessage.val();
    // Prevent markup from being injected into the message
    message = cleanInput(message);
    // if there is a non-empty message and a socket connection
    if (message && connected) {
      $inputMessage.val('');
      addChatMessage({
        username: username,
        message: message
      });
      // tell server to execute 'new message' and send along one parameter
      socket.emit('new message', message);
    }
  }

  // Log a message
  function log (message, options) {
    var $el = $('<li>').addClass('log').text(message);
    addMessageElement($el, options);
  }

  // Adds the visual chat message to the message list
  function addChatMessage (data, options) {
    // Don't fade the message in if there is an 'X was typing'
    var $typingMessages = getTypingMessages(data);
    options = options || {};
    if ($typingMessages.length !== 0) {
      options.fade = false;
      $typingMessages.remove();
    }

    var $usernameDiv = $('<span class="username"/>')
      .text(data.username)
      .css('color', getUsernameColor(data.username));
    var $messageBodyDiv = $('<span class="messageBody">')
      .text(data.message);

    var typingClass = data.typing ? 'typing' : '';
    var $messageDiv = $('<li class="message"/>')
      .data('username', data.username)
      .addClass(typingClass)
      .append($usernameDiv, $messageBodyDiv);

    addMessageElement($messageDiv, options);
  }

  // Adds the visual chat typing message
  function addChatTyping (data) {
    data.typing = true;
    data.message = 'is typing';
    addChatMessage(data);
  }

  // Removes the visual chat typing message
  function removeChatTyping (data) {
    getTypingMessages(data).fadeOut(function () {
      $(this).remove();
    });
  }

  // Adds a message element to the messages and scrolls to the bottom
  // el - The element to add as a message
  // options.fade - If the element should fade-in (default = true)
  // options.prepend - If the element should prepend
  //   all other messages (default = false)
  function addMessageElement (el, options) {
    var $el = $(el);

    // Setup default options
    if (!options) {
      options = {};
    }
    if (typeof options.fade === 'undefined') {
      options.fade = true;
    }
    if (typeof options.prepend === 'undefined') {
      options.prepend = false;
    }

    // Apply options
    if (options.fade) {
      $el.hide().fadeIn(FADE_TIME);
    }
    if (options.prepend) {
      $messages.prepend($el);
    } else {
      $messages.append($el);
    }
    $messages[0].scrollTop = $messages[0].scrollHeight;
  }

  // Prevents input from having injected markup
  function cleanInput (input) {
    return $('<div/>').text(input).text();
  }

  // Updates the typing event
  function updateTyping () {
    if (connected) {
      if (!typing) {
        typing = true;
        socket.emit('typing');
      }
      lastTypingTime = (new Date()).getTime();

      setTimeout(function () {
        var typingTimer = (new Date()).getTime();
        var timeDiff = typingTimer - lastTypingTime;
        if (timeDiff >= TYPING_TIMER_LENGTH && typing) {
          socket.emit('stop typing');
          typing = false;
        }
      }, TYPING_TIMER_LENGTH);
    }
  }

  // Gets the 'X is typing' messages of a user
  function getTypingMessages (data) {
    return $('.typing.message').filter(function (i) {
      return $(this).data('username') === data.username;
    });
  }

  // Gets the color of a username through our hash function
  function getUsernameColor (username) {
    // Compute hash code
    var hash = 7;
    for (var i = 0; i < username.length; i++) {
       hash = username.charCodeAt(i) + (hash << 5) - hash;
    }
    // Calculate color
    var index = Math.abs(hash % COLORS.length);
    return COLORS[index];
  }

  // Keyboard events

  $window.keydown(function (event) {
    // Auto-focus the current input when a key is typed
    if (!(event.ctrlKey || event.metaKey || event.altKey)) {
      //$currentInput.focus();
    }
    // When the client hits ENTER on their keyboard
    if (event.which === 13) {
      if (username) {
        sendMessage();
        socket.emit('stop typing');
        typing = false;
      } else {
        setUsername();
      }
    }
  });

  $inputMessage.on('input', function() {
    updateTyping();
  });

  // Click events

  // Focus input when clicking anywhere on login page
  $loginPage.click(function () {
    $currentInput.focus();
  });

  // Focus input when clicking on the message input's border
  $inputMessage.click(function () {
    $inputMessage.focus();
  });

  // Socket events

  // Whenever the server emits 'login', log the login message
  socket.on('login', function (data) {
    connected = true;
    // Display the welcome message
    var message = "Welcome to Socket.IO Chat – ";
    log(message, {
      prepend: true
    });
    addParticipantsMessage(data);
    console.log("Your socket number is " + data.usernumber);
    if(data.usernumber == "u1"){
      $("#stableOne").html(data.username + "'s Stable");
      $("#bankrollOne").html("Current Bankroll: $" + data.bankroll);
    }
    if(data.usernumber == "u2"){
      $("#stableTwo").html(data.username + "'s Stable");
      $("#bankrollTwo").html("Current Bankroll: $" + data.bankroll);
      socket.emit('stable', {
        high: 'five'
      });
    }
    
  });

  // Whenever the server emits 'new message', update the chat body
  socket.on('new message', function (data) {
    addChatMessage(data);
  });

  // Whenever the server emits 'user joined', log it in the chat body
  socket.on('user joined', function (data) {
    log(data.username + ' joined. He currently has $' + data.bankroll);
    addParticipantsMessage(data);
  });

  // Whenever the server emits 'user left', log it in the chat body
  socket.on('user left', function (data) {
    log(data.username + ' left');
    addParticipantsMessage(data);
    removeChatTyping(data);
  });

  // Whenever the server emits 'typing', show the typing message
  socket.on('typing', function (data) {
    addChatTyping(data);
  });

  // Whenever the server emits 'stop typing', kill the typing message
  socket.on('stop typing', function (data) {
    removeChatTyping(data);
  });
  
  // ----------------------Weird code I am testing out- by me I mean SOB----------------------
  let listColors = [['red', 'white'],['blue', 'white'],['white', 'black'],['yellow', 'black'],['green', 'white'],['black', 'gold'],['orange', 'black'],['pink', 'black'],['cyan', 'black'],['purple', 'white'],['gray', 'red'],['LawnGreen', 'black'],['brown', 'white'],['maroon', 'yellow'],['khaki', 'black'],['LightBlue', 'red'],['navy', 'white'],['green', 'yellow'],['blue', 'red'],['fuchsia', 'yellow'],['green', 'white'],['plum', 'navy']];

var horseButtons = "";
    for (var j = 0; j < 21; j++){
     horseButtons += "<button class='list_button' type='submit' value='" + (j+1) + "' id='b" + (j+1) + "' style='background-color: " + listColors[j][0] + "; color: " + listColors[j][1] + ";'> " + (j+1) + " </button>"; 
     $("#nominate_zone").html(horseButtons);
    };
  
  var bidcount = -10;
  var toBePicked = [];

  function listLoad (h){
    socket.emit('loadList', h);
  }
  
  function bidInc (){
    console.log(bidcount + " stupid");
    //bidcount + 2;
    socket.emit('bidC', bidcount);
  }
  
   $("#bid").click(function () {
    bidInc();
    //listLoad(15); 
  });
  
  $("#listSubmit").click(function () {
    let listCount = $('#numH').val();
    listLoad(listCount); 
  });
  
  $(".list_button").click(function(){
    var nomNum = $(this).attr("value");
    socket.emit('currentnom', nomNum);
  });
  
  $("#s_bid_button").click(function(){
    var bidData = $('#bid_s').val();
    socket.emit('placed_bid', bidData);
  })
  
  
  // ---------BELOW IS ALL OF THE FUNCTIONS DONE AFTER RECEIVING DATA BACK FROM THE SERVER-----------
  socket.on('removeHorses', function(data){
    let horsesTBR = data.removeNum;
    console.log(horsesTBR);
    console.log(data.thatarray);
    console.log(data);
    for (var i=21; i > horsesTBR; i--){
      $("#b"+i).remove();
    }
    $("#nominate_zone").show();
    $("#bid_zone").show();
    $("#num_of_horses").hide();
    console.log(data.usernumber + "cough cough");
  });
  
  socket.on('stableUpdate', (data) => {
    console.log(data);
    if(data.userOne == username){
      $("#stableTwo").html(data.userTwo + "'s Stable");
      $("#bankrollTwo").html("Current Bankroll: $" + data.bankrollTwo);
    }
    if(data.userTwo == username){
      $("#stableOne").html(data.userOne + "'s Stable");
      $("#bankrollOne").html("Current Bankroll: $" + data.bankrollOne);
    }
  });
  
  socket.on('nommove', (data) => {
    $("#b"+data.dataUp).remove();
    $("#c_nom").html(data.dataUp);
    //alert(data.thatarray);
  })
  
  socket.on('test_bid', (data) => {
    $("#c_nom").clone().appendTo("#stable" + data.stable);
    $("#c_nom").html(data.user + data.msg + data.win + "<br>" + data.user + data.msg2);
    $("#bankroll" + data.stable).html("Current Bankroll: $" + data.updatedBankroll);
    $("#bid_s").val('');
    console.log(data);
  });
  
  socket.on('invalid_bid', (data) => {
    alert(data.msg);
  });
  
  socket.on('tie_bid', (data) => {
    alert(data.msg);
  });
  
  socket.on('no_mas', (data) => {
    if (data.nomas = true){
      $(".list_button, #s_bid_button").prop("disabled",true);
      $(".list_button").css("background-color", "gray");
      $(".list_button").css("color", "black");
    }
  });
  
  socket.on('leftovers', (data) => {
    for(var i = 0; i < data.arr.length; i++){
      $("#stable" + data.user).append("<br>" + data.arr[i]);
      }
  });
  
  // If a user refreshes/leaves page in error
  window.addEventListener("beforeunload", function (e) {
    var confirmationMessage = 'It looks like you have been editing something. '
                            + 'If you leave before saving, your changes will be lost.';

    (e || window.event).returnValue = confirmationMessage; //Gecko + IE
    return confirmationMessage; //Gecko + Webkit, Safari, Chrome etc.
});
});