"use strict";

let currentScreen;

// Socket.io functions

let socket = io();

socket.on("connect_device", function() {
  // Checks to see if this is a mobile device
  if (/Mobi/.test(navigator.userAgent)) {
    document.getElementById("controller").className = "";
    currentScreen = "c-landing-screen";
  } else {
    socket.emit("set_host_socket");
    document.getElementById("host").className = "";
    currentScreen = "host-landing-screen";
  }
});

socket.on("join_success", function() {
  changeScreen("c-waiting-screen");
});

socket.on("load_game", function() {
  changeScreen("c-clue-screen");
});

// Jeoparty! functions

function joinGame() {
  /*
   */
  socket.emit("join_game");
}

function changeScreen(newScreen) {
  /*
   */
  document.getElementById(currentScreen).classList.add("inactive");
  document.getElementById(newScreen).classList.remove("inactive");
  currentScreen = newScreen;
}