import { dubs } from "./scratch.js";
/* global io */

$(function () {
  var aa = 2;
  console.log(dubs(5));
  var FADE_TIME = 150; // ms
  var TYPING_TIMER_LENGTH = 400; // ms
  var COLORS = [
    "#e21400",
    "#91580f",
    "#f8a700",
    "#f78b00",
    "#58dc00",
    "#287b00",
    "#a8f07a",
    "#4ae8c4",
    "#3b88eb",
    "#3824aa",
    "#a700ff",
    "#d300e7",
  ];

  // Initialize variables
  var $window = $(window);
  var $usernameInput = $(".usernameInput"); // Input for username
  var $messages = $(".messages"); // Messages area
  var $inputMessage = $(".inputMessage"); // Input message input box

  var $loginPage = $(".login.page"); // The login page
  var $chatPage = $(".chat.page"); // The chatroom page

  // Prompt for setting a username
  var username;
  var connected = false;
  var typing = false;
  var lastTypingTime;
  var $currentInput = $usernameInput.focus();

  var socket = io();
 

  

  // Sets the client's username
  function setUsername() {
    username = cleanInput($usernameInput.val().trim());

    // If the username is valid
    if (username) {
      $loginPage.fadeOut();
      $chatPage.show();
      $loginPage.off("click");
      //$currentInput = $inputMessage.focus();

      // Tell the server your username
      socket.emit("add user", username);
    }
  }

 
 

 
  // Prevents input from having injected markup
  function cleanInput(input) {
    return $("<div/>").text(input).text();
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
        //sendMessage();
        //socket.emit("stop typing");
        typing = false;
      } else {
        setUsername();
      }
    }
  });

  // Click events

  // Focus input when clicking anywhere on login page
  $loginPage.click(function () {
    $currentInput.focus();
  });

  // Socket events

  // Whenever the server emits 'login', log the login message
  socket.on("login", function (data) {
    connected = true;
    // Display the welcome message
    /* var message = "Welcome to Socket.IO Chat – ";
    log(message, {
      prepend: true,
    });
    addParticipantsMessage(data); */
    console.log("Your socket number is " + data.usernumber);
    if (data.usernumber == "u1") {
      $("#stableOne").html(`<h3>${data.username}'s Stable</h3><br>`);
      $("#bankrollOne").html("Current Bankroll: $" + data.bankroll);
    } if (data.usernumber == "u2") {
      $("#stableTwo").html(`<h3>${data.username}'s Stable</h3><br>`);
      $("#bankrollTwo").html("Current Bankroll: $" + data.bankroll);
      socket.emit("stable", {
        high: "five",
      });
    } if (data.usernumber != "u2" && data.usernumber != "u1") {
      alert(`Sorry, the max number of players have logged in already. Please wait til their auction concludes.`)
    }
  });

    // Whenever the server emits 'user joined', log it in the chat body
  socket.on("user joined", function (data) {
    //log(data.username + " joined. He currently has $" + data.bankroll);
    //addParticipantsMessage(data);
  });

  // Whenever the server emits 'user left', log it in the chat body
  socket.on("user left", function (data) {
    //log(data.username + " left");
    //addParticipantsMessage(data);
    //removeChatTyping(data);
    alert(`${data.username} left, please refresh to start a new auction.`);
  });


  // ----Horse Auction Code-----
  let listColors = [
    ["red", "white"],
    ["blue", "white"],
    ["white", "black"],
    ["yellow", "black"],
    ["green", "white"],
    ["black", "gold"],
    ["orange", "black"],
    ["pink", "black"],
    ["cyan", "black"],
    ["purple", "white"],
    ["gray", "red"],
    ["LawnGreen", "black"],
    ["brown", "white"],
    ["maroon", "yellow"],
    ["khaki", "black"],
    ["LightBlue", "red"],
    ["navy", "white"],
    ["green", "yellow"],
    ["blue", "red"],
    ["fuchsia", "yellow"],
    ["pink", "purple"],
    ["DarkMagenta", "white"],
    ["teal", "black"],
    ["teal", "black"],
    ["teal", "black"],
  ];

  var horseButtons = "";
  
  // Loops through amount of horses in race and presents the nomination buttons
  for (var j = 0; j < 23; j++) {
    horseButtons +=
      "<button class='list_button' type='submit' value='" +
      (j + 1) +
      "' id='b" +
      (j + 1) +
      "' style='background-color: " +
      listColors[j][0] +
      "; color: " +
      listColors[j][1] +
      ";'> " +
      (j + 1) +
      " </button>";
    $("#nominate_zone").html(horseButtons);
  }

  var bidcount = -10;
  var toBePicked = [];

  function listLoad(h) {
    socket.emit("loadList", h);
  }

  function bidInc() {
    console.log(bidcount + " stupid");
    //bidcount + 2;
    socket.emit("bidC", bidcount);
  }

  $("#bid").click(function () {
    bidInc();
    //listLoad(15);
  });

  $("#numHSubmit").click(function () {
    let numHCount = $("#numH").val();
    listLoad(numHCount);
  });

  $(".list_button").click(function () {
      var nomNum = $(this).attr("value");
      socket.emit("currentnom", nomNum);
  });

  $("#s_bid_button").click(function () {
    var bidData = $("#bid_s").val();
    socket.emit("placed_bid", bidData);
    $("#bid_input").hide();
    $("#bid_confirm").show();
  });

  // ---------BELOW IS ALL OF THE FUNCTIONS DONE AFTER RECEIVING DATA BACK FROM THE SERVER-----------
  socket.on("removeHorses", function (data) {
    let horsesTBR = data.removeNum;
    console.log(horsesTBR);
    console.log(data.thatarray);
    console.log(data);
    for (var i = 24; i > horsesTBR; i--) {
      $("#b" + i).remove();
    }
    $("#nominate_zone").show();
    $("#bid_zone").show();
    $("#c_nom").html(`${data.firstbid} please nominate a horse`)
    $("#num_of_horses").hide();
    console.log(data.usernumber + "cough cough");
  });

  socket.on("stableUpdate", (data) => {
    console.log(data);
    if (data.userOne == username) {
      $("#stableTwo").html(`<h3>${data.userTwo}'s Stable</h3><br>`);
      $("#bankrollTwo").html("Current Bankroll: $" + data.bankrollTwo);
    }
    if (data.userTwo == username) {
      $("#stableOne").html(`<h3>${data.userOne}'s Stable</h3><br>`);
      $("#bankrollOne").html("Current Bankroll: $" + data.bankrollOne);
    }
  });

  socket.on("nommove", (data) => {
    $("#b" + data.dataUp).remove();
    $("#c_nom").html(data.dataUp);
    $("#bid_input").show();
    $("#bid_confirm").hide();
    
    //alert(data.thatarray);
  });
  
  socket.on("doubleNom", (data) => {
    alert(data.msg);
  });

  socket.on("test_bid", (data) => {
    var winNum = $("#c_nom").html();
    $("#stable" + data.stable).append(`#${winNum} <i>for</i> $${data.win}<br>`);
    $("#c_nom").html(
      data.user + data.msg + data.win + "<br>" + data.user + data.msg2
    );
    $("#bankroll" + data.stable).html(
      "Current Bankroll: $" + data.updatedBankroll
    );
    $("#bid_s").val("");
    console.log(`${data.user} Horse ${winNum}: ${data.win}`);
    $("#bid_confirm").hide();
    
  });

  socket.on("invalid_bid", (data) => {
    alert(data.msg);
    $("#bid_confirm").hide();
    $("#bid_input").show();
  });

  socket.on("tie_bid", (data) => {
    alert(data.msg);
    $("#bid_confirm").hide();
    $("#bid_input").show();
  });

  socket.on("no_mas", (data) => {
    if ((data.nomas = true)) {
      $(".list_button, #s_bid_button").prop("disabled", true);
      $(".list_button").css("background-color", "gray");
      $(".list_button").css("color", "black");
    }
  });

  socket.on("leftovers", (data) => {
    $("#bankrollOne").hide();
    $("#bankrollTwo").hide();
    for (var i = 0; i < data.arr.length; i++) {
      $("#stable" + data.user).append(`#${data.arr[i]} <i>for</i> $1<br>`);
    }
  });

  // If a user refreshes/leaves page in error
  window.addEventListener("beforeunload", function (e) {
    var confirmationMessage =
      "It looks like you have been editing something. " +
      "If you leave before saving, your changes will be lost.";

    (e || window.event).returnValue = confirmationMessage; //Gecko + IE
    return confirmationMessage; //Gecko + Webkit, Safari, Chrome etc.
  });
});
