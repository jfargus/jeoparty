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
socket.on("display_clue", function(data) {
  if (isHost) {
    displayClue(data[0], data[1]);
  } else {

  }
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

  for (let i = 1; i < 7; i++) {
    if (isHost) {
      document.getElementById("category-" + i).innerHTML = categoryNames[i - 1].toUpperCase();
    } else {
      document.getElementById("category-" + i + "-text").innerHTML = categoryNames[i - 1].toUpperCase();
    }
  }
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
      document.getElementById(lastCategoryWrapperId).classList.remove("highlighted");
    } catch (e) {}
    lastCategoryWrapperId = wrapper.id;
    lastCategoryId = button.id;
  }

  if (wrapper.classList.contains("price")) {
    try {
      document.getElementById(lastPriceWrapperId).classList.remove("highlighted");
    } catch (e) {}
    lastPriceWrapperId = wrapper.id;
    lastPriceId = button.id;
  }

  wrapper.classList.add("highlighted");
}

function sendClueRequest() {
  /*
   */

  if (lastCategoryId != undefined && lastPriceId != undefined) {
    let clueRequest = lastCategoryId + "-" + lastPriceId;
    socket.emit("request_clue", clueRequest);
  }
}

function displayClue(clueRequest, screenQuestion) {
  /*
   */

  document.getElementById(clueRequest).classList.add("highlighted");

  moveClueScreen(clueRequest);

  document.getElementById("clue-text").innerHTML = screenQuestion;

  setTimeout(function() {
    document.getElementById(clueRequest + "-text").innerHTML = "";
    displayClueScreen();
    setTimeout(animateClueScreen, 10);
  }, 1000);
}

function displayClueScreen() {
  /*
   */

  document.getElementById("clue-screen").classList.remove("inactive");
}

function moveClueScreen(clueRequest) {
  /*
   */

  let category = clueRequest.slice(0, 10);
  let price = clueRequest.slice(11);

  let positionIndex = {
    "category-1": "-41.85vw",
    "category-2": "-25.1vw",
    "category-3": "-8.4vw",
    "category-4": "8.4vw",
    "category-5": "25.1vw",
    "category-6": "41.85vw",
    "price-1": "25vh",
    "price-2": "8vh",
    "price-3": "-8vh",
    "price-4": "-25vh",
    "price-5": "-42vh",
  };

  let clueScreen = document.getElementById("clue-screen");

  clueScreen.style.left = positionIndex[category];
  clueScreen.style.bottom = positionIndex[price];
}

function animateClueScreen() {
  /*
   */

  let clueScreen = document.getElementById("clue-screen");
  clueScreen.style.left = "0vw";
  clueScreen.style.bottom = "0vh";
  clueScreen.classList.add("animate");
}