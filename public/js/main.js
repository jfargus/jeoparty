"use strict";

let currentScreenId;
let isHost;
let lastCategoryWrapperId;
let lastCategoryId;
let lastPriceWrapperId;
let lastPriceId;
let buzzWinner;

// Timeout/interval handlers
let timerTimeout;
let livefeedInterval;
let scrapeAnswerTimeout;

// Socket.io functions

let socket = io();

// HOST + CONTROLLER
socket.on("connect_device", function() {
  // Checks to see if this is a mobile device
  if (/Mobi/.test(navigator.userAgent)) {
    adjustMobileStyle();
    document.getElementById("controller").className = "";
    currentScreenId = "c-landing-screen";
    isHost = false;
  } else {
    socket.emit("set_host_socket");
    document.getElementById("host").className = "";
    currentScreenId = "h-landing-screen";
    isHost = true;
  }
});

// CONTROLLER
socket.on("join_success", function() {
  changeWaitScreen("GAME TO START");
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
socket.on("display_clue", function(clueRequestArray) {
  if (isHost) {
    displayClue(clueRequestArray[0], clueRequestArray[1]);
  } else {
    changeScreen("buzzer-screen");
  }
});

socket.on("buzzers_ready", function() {
  if (isHost) {
    clearPlayerAnswerText();
  }
  startTimerAnimation(5);
});

socket.on("answer", function(player) {
  clearTimeout(timerTimeout);
  disableTimer();
  setTimeout(function() {
    startTimerAnimation(15);
  }, 1);

  buzzWinner = player;

  if (isHost) {
    setupPlayerLivefeed(buzzWinner);
  } else {
    changeScreen("answer-screen");
    startLivefeedInterval();
  }
});

socket.on("livefeed", function(livefeed) {
  if (isHost) {
    document.getElementById("player-livefeed").innerHTML = livefeed.toUpperCase();
  }
});

socket.on("answer_submitted", function(answerArray) {
  disableTimer();
  if (isHost) {
    displayPlayerAnswer(buzzWinner, answerArray[0], answerArray[1]);
  }
});

socket.on("display_correct_answer", function(correctAnswer) {
  if (isHost) {
    displayCorrectAnswer(correctAnswer);
  }
});

socket.on("reveal_scores", function() {
  if (isHost) {
    changeScreen("clue-screen");
    document.getElementById(currentScreenId).classList.remove("animate");
    changeScreen("score-screen");
  } else {

  }
});

socket.on("reveal_board", function() {
  if (isHost) {
    changeScreen("h-board-screen")
  } else {
    changeScreen("c-board-screen");
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

  document.getElementById(currentScreenId).classList.add("inactive");
  document.getElementById(newScreen).classList.remove("inactive");
  currentScreenId = newScreen;
}

function changeWaitScreen(waitingFor) {
  /*
   */

  document.getElementById(currentScreenId).classList.add("inactive");
  document.getElementById("c-waiting-screen").classList.remove("inactive");

  document.getElementById("c-waiting-screen-text").innerHTML = "WAITING FOR " + waitingFor.toUpperCase();

  currentScreenId = "c-waiting-screen";
}

function adjustMobileStyle() {
  /*
   */

  document.body.style.position = "fixed";

  let gameScreenIds = ["c-landing-screen", "c-waiting-screen", "c-board-screen", "buzzer-screen", "answer-screen"];

  for (let i = 0; i < gameScreenIds.length; i++) {
    document.getElementById(gameScreenIds[i]).style.height = window.innerHeight + "px";
  }

  for (let j = 1; j <= 5; j++) {
    document.getElementById("c-board-row" + "-" + j).style.height = (window.innerHeight / 5) + "px";
  }
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

  let clueElement = document.getElementById(clueRequest);

  clueElement.classList.add("highlighted");

  moveClueScreen(clueRequest);

  // TODO: Add a switch statement for responsive font size
  document.getElementById("clue-text").innerHTML = screenQuestion;

  setTimeout(function() {
    document.getElementById(clueRequest + "-text").innerHTML = "";
    clueElement.classList.remove("highlighted");
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

function startTimerAnimation(time) {
  /*
   */

  let timerId;
  let timerFrameId;

  if (isHost) {
    timerId = "h-timer";
    timerFrameId = "h-timer-frame";
  } else {
    timerId = "c-timer";
    timerFrameId = "c-timer-frame";
  }

  let timer = document.getElementById(timerId);
  let timerFrame = document.getElementById(timerFrameId);

  timer.style.transitionDuration = time + "s";

  timer.classList.remove("inactive");
  timerFrame.classList.remove("inactive");

  setTimeout(function() {
    timer.classList.add("animate");
  }, 1);

  timerTimeout = setTimeout(function() {
    timer.classList.add("inactive");
    timer.classList.remove("animate");
    timerFrame.classList.add("inactive");
  }, (time * 1000));
}

function disableTimer() {
  /*
   */

  let timerId;
  let timerFrameId;

  if (isHost) {
    timerId = "h-timer";
    timerFrameId = "h-timer-frame";
  } else {
    timerId = "c-timer";
    timerFrameId = "c-timer-frame";
  }

  let timer = document.getElementById(timerId);
  let timerFrame = document.getElementById(timerFrameId);

  timer.classList.add("inactive");
  timer.classList.remove("animate");
  timerFrame.classList.add("inactive");
}

function buzz() {
  /*
   */

  socket.emit("buzz");
  scrapeAnswerTimeout = setTimeout(function() {
    submitAnswer();
  }, 15000);
}

function setupPlayerLivefeed(player) {
  /*
   */

  // TODO: Add a switch statement for responsive font size
  document.getElementById("clue-text").className = "s-clue-text";

  document.getElementById("player-livefeed-wrapper").classList.remove("inactive");
  document.getElementById("player-livefeed-nickname").innerHTML = player.nickname.toUpperCase() + ":<br>";
}

function startLivefeedInterval() {
  /*
   */

  let answerForm = document.getElementById("answer-form");

  livefeedInterval = setInterval(function() {
    socket.emit("livefeed", answerForm.value);
    if (answerForm.value.length > 0) {
      document.getElementById("submit-answer-button").classList.remove("inactive");
    }
  }, 1);
}

function submitAnswer() {
  /*
   */

  let answerForm = document.getElementById("answer-form");

  clearInterval(livefeedInterval);
  socket.emit("submit_answer", answerForm.value);
  answerForm.value = "";

  changeWaitScreen("SCREEN");
}

function displayPlayerAnswer(player, answer, correct) {
  /*
   */

  document.getElementById("clue-text").className = "clue-text";
  document.getElementById("clue-text").innerHTML = player.nickname.toUpperCase() + "'S RESPONSE:<br>";

  let playerAnswer = document.getElementById("player-answer");
  playerAnswer.classList.remove("inactive");
  playerAnswer.innerHTML = answer.toUpperCase();

  document.getElementById("player-livefeed-wrapper").classList.add("inactive");
  document.getElementById("player-livefeed-nickname").innerHTML = "";

  playerAnswer.style.transitionDuration = "2s";

  setTimeout(function() {
    if (correct) {
      playerAnswer.style.color = "#39FF14";
    } else {
      playerAnswer.style.color = "red";
    }
  }, 1000);
}

function displayCorrectAnswer(correctAnswer) {
  /*
   */

  document.getElementById("clue-text").className = "clue-text";
  document.getElementById("clue-text").innerHTML = "CORRECT RESPONSE:<br>";

  let playerAnswer = document.getElementById("player-answer");
  playerAnswer.style.transitionDuration = "0s";
  playerAnswer.style.color = "white";
  playerAnswer.innerHTML = correctAnswer.toUpperCase();
}

function clearPlayerAnswerText() {
  /*
   */

  let playerAnswer = document.getElementById("player-answer");
  playerAnswer.innerHTML = "";
  playerAnswer.style.color = "white";
}