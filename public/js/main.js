"use strict";

let currentScreenId;
let isHost;
let players;
let lastCategoryWrapperId;
let lastCategoryId;
let lastPriceWrapperId;
let lastPriceId;
let buzzWinner;
let usedClueArray;
let currentScreenQuestion;

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
socket.on("join_success", function(categoryNames, boardController) {
  setCategoryNames(categoryNames);

  if (socket.id == boardController) {
    changeScreen("start-game-screen");
  } else {
    changeWaitScreen("GAME TO START");
  }
});

// HOST
socket.on("players", function(newPlayers) {
  if (isHost) {
    players = newPlayers;
  }
});

// HOST + CONTROLLER
socket.on("load_game", function(categoryNames, boardController, boardControllerNickname) {
  setCategoryNames(categoryNames);

  if (isHost) {
    changeScreen("h-board-screen");
    updateScoreboard();
  } else {
    if (socket.id == boardController) {
      changeScreen("c-board-screen");
    } else {
      changeWaitScreen(boardControllerNickname.toUpperCase());
    }
  }
});

// HOST + CONTROLLER
socket.on("display_clue", function(clueRequest, screenQuestion) {
  if (isHost) {
    displayClue(clueRequest, screenQuestion);
    currentScreenQuestion = screenQuestion;
  } else {
    changeScreen("buzzer-screen");
  }
});

// HOST + CONTROLLER
socket.on("buzzers_ready", function() {
  startTimerAnimation(5);
});

// HOST + CONTROLLER
socket.on("answer", function(player) {
  clearTimeout(timerTimeout);
  disableTimer();
  setTimeout(function() {
    startTimerAnimation(15);
  }, 1);

  buzzWinner = player;

  if (isHost) {
    setupPlayerLivefeed(buzzWinner, currentScreenQuestion);
  } else {
    changeScreen("answer-screen");
    startLivefeedInterval();
  }
});

// HOST
socket.on("livefeed", function(livefeed) {
  if (isHost) {
    document.getElementById("player-livefeed").innerHTML = livefeed.toUpperCase();
  }
});

// HOST + CONTROLLER
socket.on("answer_submitted", function(answer, correct) {
  disableTimer();
  if (isHost) {
    displayPlayerAnswer(buzzWinner, answer, correct);
  } else {
    changeWaitScreen("SCREEN");
  }
});

// HOST + CONTROLLER
socket.on("display_correct_answer", function(correctAnswer) {
  if (isHost) {
    displayCorrectAnswer(correctAnswer);
  } else {
    changeWaitScreen("SCREEN");
  }
});

// HOST
socket.on("reveal_scores", function() {
  if (isHost) {
    changeScreen("clue-screen");
    changeScreen("score-screen");
    clearPlayerAnswerText();
    setTimeout(updateScoreboard, 1000);
  }
});

// HOST + CONTROLLER
socket.on("reveal_board", function(newUsedClueArray, boardController, boardControllerNickname) {
  if (isHost) {
    changeScreen("h-board-screen");
    document.getElementById("clue-screen").classList.remove("animate");
  } else {
    if (socket.id == boardController) {
      resetClueButtons();
      resetCluePriceButtons();
      changeScreen("c-board-screen");
    } else {
      changeWaitScreen(boardControllerNickname.toUpperCase());
    }
  }
  usedClueArray = newUsedClueArray;
  updateCategoryOptions();
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

  let categoryNameElement;

  for (let i = 1; i < 7; i++) {
    if (isHost) {
      categoryNameElement = document.getElementById("category-" + i + "-name");
      categoryNameElement.innerHTML = categoryNames[i - 1].toUpperCase();

      if (categoryNames[i - 1].length > 45) {
        categoryNameElement.className = "xxs-h-category-name";
      } else if (categoryNames[i - 1].length > 34) {
        categoryNameElement.className = "xs-h-category-name";
      } else if (categoryNames[i - 1].length > 24) {
        categoryNameElement.className = "s-h-category-name";
      }
    } else {
      categoryNameElement = document.getElementById("category-" + i + "-text");
      categoryNameElement.innerHTML = categoryNames[i - 1].toUpperCase();

      if (categoryNames[i - 1].length > 45) {
        categoryNameElement.className = "xxs-c-category-text";
      } else if (categoryNames[i - 1].length > 34) {
        categoryNameElement.className = "xs-c-category-text";
      } else if (categoryNames[i - 1].length > 24) {
        categoryNameElement.className = "s-c-category-text";
      }
    }
  }
}

function startGame() {
  /*
   */

  socket.emit("start_game");
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

  let gameScreenIds = ["c-landing-screen", "c-waiting-screen", "start-game-screen", "c-board-screen", "buzzer-screen", "answer-screen"];

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
    updateClueOptions(button.id);
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

function updateCategoryOptions() {
  /*
   */

  let idSuffix;

  if (isHost) {
    idSuffix = "-name";
  } else {
    idSuffix = "-text";
  }

  for (let i = 1; i < 7; i++) {
    if (usedClueArray["category-" + i].length == 5) {
      let categoryButton = document.getElementById("category-" + i);
      let categoryButtonText = document.getElementById("category-" + i + idSuffix);

      categoryButton.disabled = true;
      categoryButtonText.innerHTML = "";
    }
  }
}

function updateClueOptions(categoryId) {
  /*
   */

  if (usedClueArray) {
    resetCluePriceButtons();

    for (let i = 0; i < usedClueArray[categoryId].length; i++) {
      let priceButton = document.getElementById(usedClueArray[categoryId][i]);
      let priceButtonText = document.getElementById(usedClueArray[categoryId][i] + "-text");

      priceButton.disabled = true;

      priceButtonText.innerHTML = "";
    }
  }
}

function resetCluePriceButtons() {
  /*
   */

  let prices = {
    1: "$200",
    2: "$400",
    3: "$600",
    4: "$800",
    5: "$1K",
  };

  for (let i = 1; i < 6; i++) {
    document.getElementById("price-" + i).disabled = false;

    let priceButtonText = document.getElementById("price-" + i + "-text");
    priceButtonText.innerHTML = prices[i];
  }
}

function sendClueRequest() {
  /*
   */

  if (lastCategoryId != undefined && lastPriceId != undefined) {
    let clueRequest = lastCategoryId + "-" + lastPriceId;
    socket.emit("request_clue", clueRequest);

    lastCategoryId = undefined;
    lastPriceId = undefined;
  }
}

function displayClue(clueRequest, screenQuestion) {
  /*
   */

  let clueElement = document.getElementById(clueRequest);

  clueElement.classList.add("highlighted");

  moveClueScreen(clueRequest);

  document.getElementById("clue-text").innerHTML = screenQuestion;
  adjustClueFontSize(screenQuestion, false);

  setTimeout(function() {
    document.getElementById(clueRequest + "-text").innerHTML = "";
    clueElement.classList.remove("highlighted");
    displayClueScreen();
    setTimeout(animateClueScreen, 10);
  }, 1000);
}

function adjustClueFontSize(question, livefeed) {
  /*
   */

  let clueText = document.getElementById("clue-text");

  if (livefeed) {
    if (question.length > 300) {
      clueText.className = "xxxs-clue-text";
    } else if (question.length > 200) {
      clueText.className = "xxs-clue-text";
    } else if (question.length > 145) {
      clueText.className = "xs-clue-text";
    } else {
      clueText.className = "s-clue-text";
    }
  } else {
    if (question.length > 300) {
      clueText.className = "xxs-clue-text";
    } else if (question.length > 200) {
      clueText.className = "xs-clue-text";
    } else if (question.length > 145) {
      clueText.className = "s-clue-text";
    } else {
      clueText.className = "clue-text";
    }
  }
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

function setupPlayerLivefeed(player, screenQuestion) {
  /*
   */

  adjustClueFontSize(screenQuestion, true);

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
  clearTimeout(scrapeAnswerTimeout);

  document.getElementById("submit-answer-button").classList.add("inactive");

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
  playerAnswer.classList.remove("inactive");
  playerAnswer.style.transitionDuration = "0s";
  playerAnswer.style.color = "white";
  playerAnswer.innerHTML = correctAnswer.toUpperCase();
}

function clearPlayerAnswerText() {
  /*
   */

  let playerAnswer = document.getElementById("player-answer");
  playerAnswer.classList.add("inactive");
  playerAnswer.innerHTML = "";
  playerAnswer.style.color = "white";
}

function resetClueButtons() {
  /*
   */

  document.getElementById(lastCategoryWrapperId).classList.remove("highlighted");
  document.getElementById(lastPriceWrapperId).classList.remove("highlighted");
}

function updateScoreboard() {
  /*
   */

  let playersLength = Object.keys(players).length;

  let podiumOne = document.getElementById("podium-1");
  let podiumTwo = document.getElementById("podium-2");
  let podiumThree = document.getElementById("podium-3");
  let overflow = document.getElementById("overflow-row");

  overflow.className = "inactive row overflow-row";
  overflow.innerHTML = "";

  if (playersLength == 1) {
    podiumOne.className = "col-12";
    podiumTwo.className = "inactive";
    podiumThree.className = "inactive";
  } else if (playersLength == 2) {
    podiumOne.className = "col-6";
    podiumTwo.className = "col-6";
    podiumThree.className = "inactive";
  } else if (playersLength == 3) {
    podiumOne.className = "col-4";
    podiumTwo.className = "col-4";
    podiumThree.className = "col-4";
    overflow.classList.remove("inactive");
  }

  let i = 1;

  for (let id in players) {
    if (i <= 3) {
      let nicknameText = document.getElementById("player-" + i + "-nickname");
      nicknameText.innerHTML = players[id].nickname.toUpperCase();
      if (players[id].nickname.length > 15) {
        nicknameText.className = "xs-nickname-text";
      } else if (players[id].nickname.length > 8) {
        nicknameText.className = "s-nickname-text";
      } else {
        nicknameText.className = "nickname-text";
      }

      let scoreText = document.getElementById("player-" + i + "-score-text");
      if (players[id].score < 0) {
        scoreText.innerHTML = "-$" + Math.abs(players[id].score);
        scoreText.style.color = "red";
      } else {
        scoreText.innerHTML = "$" + players[id].score;
        scoreText.style.color = "white";
      }
    } else {
      overflow.innerHTML += players[id].nickname.toUpperCase() + ": ";
      if (players[id].score < 0) {
        overflow.innerHTML += "<span class='red-overflow-text'>-$" + Math.abs(players[id].score) + "</span>";
      } else {
        overflow.innerHTML += "$" + players[id].score;
      }
      if (playersLength > 4) {
        overflow.innerHTML += " ... ";
      }
    }
    i++;
  }
}