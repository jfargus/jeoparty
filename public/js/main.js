"use strict";

let currentScreen;
let isHost;

let lastCategoryWrapperId;
let lastCategoryId;
let lastPriceWrapperId;
let lastPriceId;

// Socket.io functions

let socket = io();

// HOST + CONTROLLER
socket.on("connect_device", function() {
  // Checks to see if this is a mobile device
  if (/Mobi/.test(navigator.userAgent)) {
    document.getElementById("controller").className = "";
    currentScreen = "c-landing-screen";
    isHost = false;
  } else {
    socket.emit("set_host_socket");
    document.getElementById("host").className = "";
    currentScreen = "h-landing-screen";
    isHost = true;
  }
});

// CONTROLLER
socket.on("join_success", function() {
  changeScreen("c-waiting-screen");
});

// HOST + CONTROLLER
socket.on("load_game", function(categoryNames) {
  if (isHost) {
    changeScreen("h-board-screen")
  } else {
    changeScreen("c-board-screen");
  }
  setCategoryNames(categoryNames);
});

// HOST + CONTROLLER
socket.on("display_clue", function() {
  if (isHost) {} else {}
});

// Jeoparty! functions

function joinGame() {
  /*
   */

  socket.emit("join_game");
}

function setCategoryNames(categoryNames) {
  /*
   */

}

function changeScreen(newScreen) {
  /*
   */

  document.getElementById(currentScreen).classList.add("inactive");
  document.getElementById(newScreen).classList.remove("inactive");
  currentScreen = newScreen;
}

function pressClueButton(button) {
  /*
   */

  let wrapper = document.getElementById(button.id + "-wrapper");

  if (wrapper.classList.contains("category")) {
    try {
      document.getElementById(lastCategoryWrapperId).classList.remove("highlighted-button");
    } catch (e) {}
    lastCategoryWrapperId = wrapper.id;
    lastCategoryId = button.id;
  }

  if (wrapper.classList.contains("price")) {
    try {
      document.getElementById(lastPriceWrapperId).classList.remove("highlighted-button");
    } catch (e) {}
    lastPriceWrapperId = wrapper.id;
    lastPriceId = button.id;
  }

  wrapper.classList.add("highlighted-button");
}

function sendClueRequest() {
  /*
   */

  if (lastCategoryId != undefined && lastPriceId != undefined) {
    let clueRequest = lastCategoryId + "-" + lastPriceId;
    socket.emit("request_clue", clueRequest);
  }
}