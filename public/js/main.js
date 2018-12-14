"use strict";

let currentScreenId;
let isHost;
let audioAllowed = false;
let audioFiles;
let players;
let lastCategoryWrapperId;
let lastCategoryId;
let lastPriceWrapperId;
let lastPriceId;
let buzzWinner;
let usedClueArray;
let currentScreenQuestion;
let doubleJeoparty = false;

// Timeout/interval handlers
let questionInterval;
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
    document.body.style.backgroundImage = "url('/graphics/background.png')";
    document.getElementById("host").className = "";
    currentScreenId = "h-landing-screen";
    isHost = true;
  }
});

// HOST
socket.on("update_players_connected", function(playersConnected) {
  if (isHost) {
    let playersConnectedText = document.getElementById("players-connected");

    if (playersConnected == 1) {
      playersConnectedText.innerHTML = playersConnected + " PLAYER CONNECTED";
    } else {
      playersConnectedText.innerHTML = playersConnected + " PLAYERS CONNECTED";
    }
  }
});

// CONTROLLER
socket.on("join_success", function(categoryNames, boardController) {
  setCategoryText(categoryNames, undefined);

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
socket.on("load_game", function(categoryNames, categoryDates, boardController, boardControllerNickname) {
  setCategoryText(categoryNames, categoryDates);

  if (isHost) {
    if (audioAllowed) {
      audioFiles["landing_screen_theme"].pause();
    }
    voice(getRandomBoardControllerIntro() + boardControllerNickname, .1);
    changeScreen("h-board-screen");
    updateScoreboard(players);
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
    playAudio("clue_selected");
    voice(screenQuestion, 1);
    setTimeout(startQuestionInterval, 2000);
    clearPlayerAnswerText();
    displayClue(clueRequest, screenQuestion, false);
    currentScreenQuestion = screenQuestion;
  } else {
    changeScreen("buzzer-screen");
  }
});

// HOST + CONTROLLER
socket.on("daily_double", function(clueRequest, screenQuestion, boardController, boardControllerNickname) {
  if (isHost) {
    clearPlayerAnswerText();
    displayClue(clueRequest, screenQuestion, true);
  } else {
    if (socket.id == boardController) {

    } else {
      changeWaitScreen(boardControllerNickname.toUpperCase());
    }
  }
});

// HOST + CONTROLLER
socket.on("buzzers_ready", function(playersAnswered) {
  if (isHost) {
    startTimerAnimation(5);
    if (playersAnswered.length > 0) {
      document.getElementById("clue-text").innerHTML = currentScreenQuestion;
      adjustClueFontSize(currentScreenQuestion, false);
      clearPlayerAnswerText();
    }
  } else {
    if (playersAnswered.includes(socket.id)) {
      changeWaitScreen("OTHER PLAYERS");
    } else {
      changeScreen("buzzer-screen");
      toggleBlinkingBuzzerLight(true);
      startTimerAnimation(5);
    }
  }
});

// HOST + CONTROLLER
socket.on("answer", function(player) {
  try {
    clearTimeout(timerTimeout);
  } catch (e) {}

  buzzWinner = player;

  disableTimer();
  startTimerAnimation(15.5);

  if (isHost) {
    playAudio("buzzer");
    setupPlayerLivefeed(buzzWinner, currentScreenQuestion);
  } else {
    toggleBlinkingBuzzerLight(false);
    if (socket.id == player.id) {
      changeBuzzerLightColor(true, true);
      setTimeout(function() {
        changeScreen("answer-screen");
        startLivefeedInterval();
        changeBuzzerLightColor(false, false);
      }, 500);
    } else {
      changeBuzzerLightColor(true, false);
      setTimeout(function() {
        changeWaitScreen(player.nickname);
        changeBuzzerLightColor(false, false);
      }, 500);
    }
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
socket.on("display_correct_answer", function(correctAnswer, timesUp) {
  if (isHost) {
    if (timesUp) {
      playAudio("times_up");
    }
    voice(getRandomAnswerIntro() + correctAnswer, .5);
    displayCorrectAnswer(correctAnswer);
  } else {
    if (timesUp) {
      toggleBlinkingBuzzerLight(false);
    }
    changeWaitScreen("SCREEN");
  }
});

// HOST
socket.on("reveal_scores", function() {
  if (isHost) {
    changeScreen("clue-screen");
    changeScreen("score-screen");
    setTimeout(function() {
      updateScoreboard(players);
    }, 1000);
  }
});

// HOST + CONTROLLER
socket.on("reveal_board", function(newUsedClueArray, boardController, boardControllerNickname) {
  if (isHost) {
    changeScreen("h-board-screen");
    document.getElementById("clue-screen").classList.remove("animate");
    voice(getRandomBoardControllerIntro() + boardControllerNickname, .1);
  } else {
    if (socket.id == boardController) {
      changeScreen("c-board-screen");
      resetClueButtons();
      resetCluePriceButtons();
    } else {
      changeWaitScreen(boardControllerNickname.toUpperCase());
    }
  }
  usedClueArray = newUsedClueArray;
  updateCategoryOptions();
});

// HOST + CONTROLLER
socket.on("setup_double_jeoparty", function(categoryNames, categoryDates) {
  setDoubleJeopartyPriceText();
  setCategoryText(categoryNames, categoryDates);
  if (isHost) {
    clearPlayerAnswerText();
  }
});

// Jeoparty! functions

function declareAudioFiles() {
  /*
   */

  audioAllowed = true;
  audioFiles = {
    "landing_screen_theme": new Audio("/audio/landing_screen_theme.mp3"),
    "clue_selected": new Audio("/audio/clue_selected.mp3"),
    "buzzer": new Audio("/audio/buzzer.wav"),
    "times_up": new Audio("/audio/times_up.mp3"),
    "applause": new Audio("/audio/applause.mp3"),
    "aww": new Audio("/audio/aww.mp3"),
    "daily_double": new Audio("/audio/daily_double.mp3"),
    "final_jeoparty_category": new Audio("/audio/final_jeoparty_category.mp3"),
    "main_theme": new Audio("/audio/main_theme.mp3"),
    "big_applause": new Audio("/audio/big_applause.mp3"),
  };

  if (currentScreenId == "h-landing-screen") {
    playAudio("landing_screen_theme");
  }
}

function playAudio(filename) {
  /*
   */

  if (audioAllowed) {
    if (audioFiles[filename].paused) {
      audioFiles[filename].play();
    }
  }
}

function joinGame() {
  /*
   */

  let nickname = document.getElementById("nickname-form").value;
  let signature = document.getElementById("sketchpad").toDataURL("image/png");

  socket.emit("join_game", nickname, signature);
}

function setCategoryText(categoryNames, categoryDates) {
  /*
   */

  let categoryNameElement;

  for (let i = 1; i < 7; i++) {
    if (isHost) {
      categoryNameElement = document.getElementById("category-" + i + "-name");
      categoryNameElement.innerHTML = categoryNames[i - 1].toUpperCase();

      document.getElementById("category-" + i + "-date").innerHTML = "(" + categoryDates[i - 1] + ")";

      if (categoryNames[i - 1].length > 45) {
        categoryNameElement.className = "xxxs-h-category-name";
      } else if (categoryNames[i - 1].length > 32) {
        categoryNameElement.className = "xxs-h-category-name";
      } else if (categoryNames[i - 1].length > 24) {
        categoryNameElement.className = "xs-h-category-name";
      } else if (categoryNames[i - 1].length > 10) {
        categoryNameElement.className = "s-h-category-name";
      } else {
        categoryNameElement.className = "h-category-name";
      }
    } else {
      categoryNameElement = document.getElementById("category-" + i + "-text");
      categoryNameElement.innerHTML = categoryNames[i - 1].toUpperCase();

      if (categoryNames[i - 1].length > 45) {
        categoryNameElement.className = "xxs-c-category-text";
      } else if (categoryNames[i - 1].length > 30) {
        categoryNameElement.className = "xs-c-category-text";
      } else if (categoryNames[i - 1].length > 13) {
        categoryNameElement.className = "s-c-category-text";
      }
    }
  }
}

function startGame() {
  /*
   */

  let start = confirm("Are you sure everyone is connected to the game?");

  if (start) {
    socket.emit("start_game");
  }
}

function changeScreen(newScreen) {
  /*
   */

  document.getElementById(currentScreenId).classList.add("inactive");
  document.getElementById(newScreen).classList.remove("inactive");
  currentScreenId = newScreen;
}

function voice(text, delay) {
  /*
   */

  if (audioAllowed) {
    speechSynthesis.cancel();

    setTimeout(function() {
      if (window.speechSynthesis.getVoices().length == 0) {
        window.speechSynthesis.onvoiceschanged = function() {
          textToSpeech(text);
        };
      } else {
        textToSpeech(text);
      }

      function textToSpeech(text) {
        let msg = new SpeechSynthesisUtterance();
        let voices = window.speechSynthesis.getVoices();
        if (voices.length > 48) {
          msg.voice = voices[50];
        } else {
          msg.voice = voices[0];
        }
        msg.voiceURI = 'native';
        msg.volume = 1;
        msg.rate = 1;
        msg.pitch = 1;
        msg.text = text;
        msg.lang = 'en-US';

        if (!speechSynthesis.speaking) {
          speechSynthesis.speak(msg);
        }
      }
    }, (delay * 1000));
  }
}

function startQuestionInterval() {
  /*
   */

  questionInterval = setInterval(function() {
    if (!window.speechSynthesis.speaking) {
      clearInterval(questionInterval);
      socket.emit("activate_buzzers");
    }
  }, 1);
}

function changeWaitScreen(waitingFor) {
  /*
   */

  if (currentScreenId != "c-waiting-screen") {
    document.getElementById(currentScreenId).classList.add("inactive");
    document.getElementById("c-waiting-screen").classList.remove("inactive");

    currentScreenId = "c-waiting-screen";
  }

  document.getElementById("c-waiting-screen-text").innerHTML = "WAITING FOR " + waitingFor.toUpperCase();
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

      if (isHost) {
        document.getElementById("category-" + i + "-date-wrapper").classList.add("inactive");
      }
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

  let prices;

  if (doubleJeoparty) {
    prices = {
      1: "$400",
      2: "$800",
      3: "$1.2K",
      4: "$1.6K",
      5: "$2K",
    };
  } else {
    prices = {
      1: "$200",
      2: "$400",
      3: "$600",
      4: "$800",
      5: "$1K",
    };
  }

  for (let i = 1; i < 6; i++) {
    document.getElementById("price-" + i).disabled = false;

    let priceButtonText = document.getElementById("price-" + i + "-text");
    priceButtonText.innerHTML = prices[i];
  }
}

function getRandomBoardControllerIntro() {
  /*
   */

  let intros = [
    "Pick a category ",
    "It's your choice",
    "You control the board ",
    "Make a selection ",
    "The choice is yours ",
    "Take your pick ",
    "Pick a clue ",
    "Select a clue "
  ];

  let intro = intros[Math.floor(Math.random() * intros.length)];

  return intro;
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

function displayClue(clueRequest, screenQuestion, dailyDouble) {
  /*
   */

  let clueElement = document.getElementById(clueRequest);

  clueElement.classList.add("highlighted");

  moveClueScreen(clueRequest);

  let clueText = document.getElementById("clue-text");

  if (dailyDouble) {
    clueText.className = "daily-double-text";
    clueText.innerHTML = "DAILY DOUBLE";
  } else {
    clueText.innerHTML = screenQuestion;
    adjustClueFontSize(screenQuestion, false);
  }

  setTimeout(function() {
    document.getElementById(clueRequest + "-text").innerHTML = "";
    clueElement.classList.remove("highlighted");
    displayClueScreen();
    if (dailyDouble) {
      document.getElementById("daily-double-wrapper").className = "daily-double-wrapper-screen";
      document.getElementById("clue-screen").className = "daily-double-screen";
    }
    setTimeout(animateClueScreen, 10);
  }, 1000);
}

function adjustClueFontSize(question, livefeed) {
  /*
   */

  let clueText = document.getElementById("clue-text");
  let clueTextRow = document.getElementById("clue-text-row");

  if (livefeed) {
    if (question.length > 300) {
      clueText.className = "xxxs-clue-text";
      clueTextRow.style.lineHeight = "5vh";
    } else if (question.length > 200) {
      clueText.className = "xxs-clue-text";
      clueTextRow.style.lineHeight = "6vh";
    } else if (question.length > 145) {
      clueText.className = "xs-clue-text";
      clueTextRow.style.lineHeight = "8vh";
    } else {
      clueText.className = "s-clue-text";
      clueTextRow.style.lineHeight = "10vh";
    }
  } else {
    if (question.length > 300) {
      clueText.className = "xxs-clue-text";
      clueTextRow.style.lineHeight = "6vh";
    } else if (question.length > 200) {
      clueText.className = "xs-clue-text";
      clueTextRow.style.lineHeight = "8vh";
    } else if (question.length > 145) {
      clueText.className = "s-clue-text";
      clueTextRow.style.lineHeight = "10vh";
    } else {
      clueText.className = "clue-text";
      clueTextRow.style.lineHeight = "12vh";
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

  timer.classList.remove("inactive");
  timerFrame.classList.remove("inactive");

  timer.style.transition = "linear transform " + time + "s";

  setTimeout(function() {
    timer.classList.add("animate");
  }, 100);

  timerTimeout = setTimeout(function() {
    timer.classList.add("inactive");
    timer.classList.remove("animate");
    timerFrame.classList.add("inactive");

    timer.style.transition = "linear transform 0s";
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

  try {
    timer.classList.add("inactive");
    timer.classList.remove("animate");
    timerFrame.classList.add("inactive");
  } catch (e) {}

  timer.offsetHeight;
}

function toggleBlinkingBuzzerLight(blinking) {
  /*
   */

  let blinkingBuzzerLight = document.getElementById("blinking-buzzer-light");

  if (blinking) {
    blinkingBuzzerLight.classList.remove("inactive");
  } else {
    blinkingBuzzerLight.classList.add("inactive");
  }
}

function changeBuzzerLightColor(active, correct) {
  /*
   */

  let buzzerLight = document.getElementById("buzzer-light");

  if (active) {
    buzzerLight.classList.remove("inactive");
    if (correct) {
      buzzerLight.style.backgroundColor = "#39FF14";
    } else {
      buzzerLight.style.backgroundColor = "red";
    }
  } else {
    buzzerLight.classList.add("inactive");
    buzzerLight.style.backgroundColor = "transparent";
  }
}

function buzz() {
  /*
   */

  socket.emit("buzz");
  try {
    clearTimeout(scrapeAnswerTimeout);
  } catch (e) {}
  scrapeAnswerTimeout = setTimeout(submitAnswer, 15500);
}

function setupPlayerLivefeed(player, screenQuestion) {
  /*
   */

  adjustClueFontSize(screenQuestion, true);

  document.getElementById("player-livefeed-wrapper").classList.remove("inactive");
  document.getElementById("player-livefeed-nickname").innerHTML = player.nickname.toUpperCase() + ":<br>";
  clearPlayerAnswerText();
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
      playAudio("applause");
      playerAnswer.style.color = "#39FF14";
    } else {
      playAudio("aww");
      playerAnswer.style.color = "red";
    }
  }, 1000);
}

function getRandomAnswerIntro() {
  /*
   */

  let intros = [
    "The correct answer is ",
    "The correct response is",
    "The answer is ",
    "The answer we were looking for is ",
    "The response we were looking for is ",
    "How about ",
  ];

  let intro = intros[Math.floor(Math.random() * intros.length)];

  return intro;
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
  playerAnswer.className = "inactive clue-text"
  playerAnswer.innerHTML = "";
  playerAnswer.style.color = "white";
}

function resetClueButtons() {
  /*
   */

  // Player's wrapper variables may still be undefined
  try {
    document.getElementById(lastCategoryWrapperId).classList.remove("highlighted");
    document.getElementById(lastPriceWrapperId).classList.remove("highlighted");
  } catch (e) {}
}

function updateScoreboard(players) {
  /*
   */

  let clone = JSON.parse(JSON.stringify(players));

  let playersLength = Object.keys(clone).length;

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
  } else {
    overflow.classList.remove("inactive");

    let keys = Object.keys(clone);
    keys.sort(function(a, b) {
      return clone[b].score - clone[a].score;
    });
    let newClone = [clone[keys[1]], clone[keys[0]], clone[keys[2]]];
    for (let j = 0; j < playersLength - 3; j++) {
      newClone.push(clone[keys[j + 3]]);
    }
    clone = newClone;
  }

  let i = 1;

  for (let id in clone) {
    if (i <= 3) {
      let nicknameText = document.getElementById("player-" + i + "-nickname");
      nicknameText.innerHTML = clone[id].nickname.toUpperCase();
      if (clone[id].nickname.length > 15) {
        nicknameText.className = "xs-nickname-text";
      } else if (clone[id].nickname.length > 8) {
        nicknameText.className = "s-nickname-text";
      } else {
        nicknameText.className = "nickname-text";
      }

      let scoreText = document.getElementById("player-" + i + "-score-text");
      if (clone[id].score < 0) {
        scoreText.innerHTML = "-$" + Math.abs(clone[id].score);
        scoreText.style.color = "red";
      } else {
        scoreText.innerHTML = "$" + clone[id].score;
        scoreText.style.color = "white";
      }

      let signatureCanvas = document.getElementById("player-" + i + "-signature-canvas");
      let ctx = signatureCanvas.getContext('2d');
      let signature = new Image();

      signature.onload = function() {
        signatureCanvas.width = signatureCanvas.width;

        // Draw color
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, 250, 250);

        // Set composite mode
        ctx.globalCompositeOperation = "destination-in";

        // Draw image
        ctx.drawImage(signature, 0, 0);
      };
      signature.src = clone[id].signature;

    } else {
      overflow.innerHTML += clone[id].nickname.toUpperCase() + ": ";
      if (clone[id].score < 0) {
        overflow.innerHTML += "<span class='red-overflow-text'>-$" + Math.abs(clone[id].score) + "</span>";
      } else {
        overflow.innerHTML += "$" + clone[id].score;
      }
      if (playersLength > 4) {
        overflow.innerHTML += " ... ";
      }
    }
    i++;
  }
}

function setDoubleJeopartyPriceText() {
  /*
   */

  doubleJeoparty = true;

  let priceText;

  if (isHost) {
    for (let i = 1; i <= 6; i++) {
      for (let j = 1; j <= 5; j++) {
        priceText = document.getElementById("category-" + i + "-price-" + j + "-text");
        priceText.innerHTML = "$" + (j * 400);
      }
    }
  } else {
    for (let i = 1; i <= 5; i++) {
      priceText = document.getElementById("price-" + i + "-text");
      if ((i * 400) == 1200) {
        priceText.innerHTML = "$1.2K";
      } else if ((i * 400) == 1600) {
        priceText.innerHTML = "$1.6K";
      } else if ((i * 400) == 2000) {
        priceText.innerHTML = "2K";
      } else {
        priceText.innerHTML = "$" + (i * 400);
      }
    }
  }
}