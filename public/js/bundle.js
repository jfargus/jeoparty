(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
/*! NoSleep.min.js v0.9.0 - git.io/vfn01 - Rich Tibbett - MIT license */
!function(A,e){"object"==typeof exports&&"object"==typeof module?module.exports=e():"function"==typeof define&&define.amd?define([],e):"object"==typeof exports?exports.NoSleep=e():A.NoSleep=e()}("undefined"!=typeof self?self:this,function(){return function(A){function e(B){if(o[B])return o[B].exports;var Q=o[B]={i:B,l:!1,exports:{}};return A[B].call(Q.exports,Q,Q.exports,e),Q.l=!0,Q.exports}var o={};return e.m=A,e.c=o,e.d=function(A,o,B){e.o(A,o)||Object.defineProperty(A,o,{configurable:!1,enumerable:!0,get:B})},e.n=function(A){var o=A&&A.__esModule?function(){return A.default}:function(){return A};return e.d(o,"a",o),o},e.o=function(A,e){return Object.prototype.hasOwnProperty.call(A,e)},e.p="",e(e.s=0)}([function(A,e,o){"use strict";function B(A,e){if(!(A instanceof e))throw new TypeError("Cannot call a class as a function")}var Q=function(){function A(A,e){for(var o=0;o<e.length;o++){var B=e[o];B.enumerable=B.enumerable||!1,B.configurable=!0,"value"in B&&(B.writable=!0),Object.defineProperty(A,B.key,B)}}return function(e,o,B){return o&&A(e.prototype,o),B&&A(e,B),e}}(),t=o(1),n=t.webm,c=t.mp4,E="undefined"!=typeof navigator&&parseFloat((""+(/CPU.*OS ([0-9_]{3,4})[0-9_]{0,1}|(CPU like).*AppleWebKit.*Mobile/i.exec(navigator.userAgent)||[0,""])[1]).replace("undefined","3_2").replace("_",".").replace("_",""))<10&&!window.MSStream,l=function(){function A(){var e=this;B(this,A),E?this.noSleepTimer=null:(this.noSleepVideo=document.createElement("video"),this.noSleepVideo.setAttribute("muted",""),this.noSleepVideo.setAttribute("title","No Sleep"),this.noSleepVideo.setAttribute("playsinline",""),this._addSourceToVideo(this.noSleepVideo,"webm",n),this._addSourceToVideo(this.noSleepVideo,"mp4",c),this.noSleepVideo.addEventListener("loadedmetadata",function(){e.noSleepVideo.duration<=1?e.noSleepVideo.setAttribute("loop",""):e.noSleepVideo.addEventListener("timeupdate",function(){e.noSleepVideo.currentTime>.5&&(e.noSleepVideo.currentTime=Math.random())})}))}return Q(A,[{key:"_addSourceToVideo",value:function(A,e,o){var B=document.createElement("source");B.src=o,B.type="video/"+e,A.appendChild(B)}},{key:"enable",value:function(){E?(this.disable(),console.warn("\n        NoSleep enabled for older iOS devices. This can interrupt\n        active or long-running network requests from completing successfully.\n        See https://github.com/richtr/NoSleep.js/issues/15 for more details.\n      "),this.noSleepTimer=window.setInterval(function(){document.hidden||(window.location.href=window.location.href.split("#")[0],window.setTimeout(window.stop,0))},15e3)):this.noSleepVideo.play()}},{key:"disable",value:function(){E?this.noSleepTimer&&(console.warn("\n          NoSleep now disabled for older iOS devices.\n        "),window.clearInterval(this.noSleepTimer),this.noSleepTimer=null):this.noSleepVideo.pause()}}]),A}();A.exports=l},function(A,e,o){"use strict";A.exports={webm:"data:video/webm;base64,GkXfo0AgQoaBAUL3gQFC8oEEQvOBCEKCQAR3ZWJtQoeBAkKFgQIYU4BnQI0VSalmQCgq17FAAw9CQE2AQAZ3aGFtbXlXQUAGd2hhbW15RIlACECPQAAAAAAAFlSua0AxrkAu14EBY8WBAZyBACK1nEADdW5khkAFVl9WUDglhohAA1ZQOIOBAeBABrCBCLqBCB9DtnVAIueBAKNAHIEAAIAwAQCdASoIAAgAAUAmJaQAA3AA/vz0AAA=",mp4:"data:video/mp4;base64,AAAAIGZ0eXBtcDQyAAACAGlzb21pc28yYXZjMW1wNDEAAAAIZnJlZQAACKBtZGF0AAAC8wYF///v3EXpvebZSLeWLNgg2SPu73gyNjQgLSBjb3JlIDE0MiByMjQ3OSBkZDc5YTYxIC0gSC4yNjQvTVBFRy00IEFWQyBjb2RlYyAtIENvcHlsZWZ0IDIwMDMtMjAxNCAtIGh0dHA6Ly93d3cudmlkZW9sYW4ub3JnL3gyNjQuaHRtbCAtIG9wdGlvbnM6IGNhYmFjPTEgcmVmPTEgZGVibG9jaz0xOjA6MCBhbmFseXNlPTB4MToweDExMSBtZT1oZXggc3VibWU9MiBwc3k9MSBwc3lfcmQ9MS4wMDowLjAwIG1peGVkX3JlZj0wIG1lX3JhbmdlPTE2IGNocm9tYV9tZT0xIHRyZWxsaXM9MCA4eDhkY3Q9MCBjcW09MCBkZWFkem9uZT0yMSwxMSBmYXN0X3Bza2lwPTEgY2hyb21hX3FwX29mZnNldD0wIHRocmVhZHM9NiBsb29rYWhlYWRfdGhyZWFkcz0xIHNsaWNlZF90aHJlYWRzPTAgbnI9MCBkZWNpbWF0ZT0xIGludGVybGFjZWQ9MCBibHVyYXlfY29tcGF0PTAgY29uc3RyYWluZWRfaW50cmE9MCBiZnJhbWVzPTMgYl9weXJhbWlkPTIgYl9hZGFwdD0xIGJfYmlhcz0wIGRpcmVjdD0xIHdlaWdodGI9MSBvcGVuX2dvcD0wIHdlaWdodHA9MSBrZXlpbnQ9MzAwIGtleWludF9taW49MzAgc2NlbmVjdXQ9NDAgaW50cmFfcmVmcmVzaD0wIHJjX2xvb2thaGVhZD0xMCByYz1jcmYgbWJ0cmVlPTEgY3JmPTIwLjAgcWNvbXA9MC42MCBxcG1pbj0wIHFwbWF4PTY5IHFwc3RlcD00IHZidl9tYXhyYXRlPTIwMDAwIHZidl9idWZzaXplPTI1MDAwIGNyZl9tYXg9MC4wIG5hbF9ocmQ9bm9uZSBmaWxsZXI9MCBpcF9yYXRpbz0xLjQwIGFxPTE6MS4wMACAAAAAOWWIhAA3//p+C7v8tDDSTjf97w55i3SbRPO4ZY+hkjD5hbkAkL3zpJ6h/LR1CAABzgB1kqqzUorlhQAAAAxBmiQYhn/+qZYADLgAAAAJQZ5CQhX/AAj5IQAD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"}}])});
},{}],2:[function(require,module,exports){
"use strict";

let nosleep = require("nosleep.js");

let waitingToJoin = false;
let joined = false;
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
let maxWager;
let dailyDouble = false;
let finalJeoparty = false;
let finalJeopartyClue;
let finalJeopartyPlayer;

// Timeout/interval handlers
let questionInterval;
let timerTimeout;
let livefeedInterval;
let wagerLivefeedInterval;
let scrapeAnswerTimeout;
let scrapeWagerTimeout;

// Socket logic

let socket = io();

// HOST & CONTROLLER
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

socket.on("reconnect_device", function() {
  adjustMobileStyle();
  document.getElementById("controller").className = "";
  currentScreenId = "c-landing-screen";
  changeScreen("start-game-screen");
  toggleRejoinGameButton(true);
  isHost = false;
});

// HOST
socket.on("update_players_connected", function(playersConnected) {
  /*
  Input:
  playersConnected: array of strings (socket ids)
   */

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
socket.on("join_success", function(categoryNames, boardController, gameActive) {
  /*
  Input:
  categoryNames: array of strings
  boardController: string (socket id)
   */

  if (doubleJeoparty) {
    alert("The game's too far along for you to join, sorry!");
    changeWaitScreen("", true);
  } else {
    if (gameActive) {
      waitingToJoin = true;
      changeWaitScreen("NEXT CLUE", false);
    } else {
      joined = true;
    }

    setCategoryText(categoryNames, undefined);

    if (socket.id == boardController) {
      changeScreen("start-game-screen");
    } else {
      if (!waitingToJoin) {
        changeWaitScreen("GAME TO START", false);
      }
    }
  }
});

// HOST
socket.on("players", function(newPlayers) {
  /*
  Input:
  newPlayers: array of objects (players)
   */

  if (isHost) {
    players = newPlayers;
  }
});

// HOST & CONTROLLER
socket.on("load_game", function(categoryNames, categoryDates, boardController, boardControllerNickname) {
  /*
  Input:
  categoryNames: array of strings
  categoryDates: array of numbers
  boardController: string (socket id)
  boardControllerNickname: string
   */

  setCategoryText(categoryNames, categoryDates);

  if (isHost) {
    if (audioAllowed) {
      audioFiles["landing_screen_theme"].pause();
    }
    voice(getRandomBoardControllerIntro() + boardControllerNickname, .1);
    changeScreen("h-board-screen");
    updateScoreboard(players);
  } else {
    if (joined) {
      if (socket.id == boardController) {
        changeScreen("c-board-screen");
      } else {
        changeWaitScreen(boardControllerNickname.toUpperCase(), false);
      }
    }
  }
});

// HOST & CONTROLLER
socket.on("display_clue", function(clueRequest, screenQuestion) {
  /*
  Input:
  clueRequest: string ("category-x-price-y")
  screenQuestion: string
   */

  if (isHost) {
    playAudio("clue_selected");
    voice(screenQuestion, 1);
    setTimeout(startQuestionInterval, 2000);
    clearPlayerAnswerText();
    displayClue(clueRequest, screenQuestion, false);
    currentScreenQuestion = screenQuestion;
  } else {
    if (joined) {
      changeScreen("buzzer-screen");
    }
  }
});

// HOST & CONTROLLER
socket.on("daily_double_request", function(clueRequest, screenQuestion, boardController, boardControllerNickname) {
  /*
  Input:
  clueRequest: string ("category-x-price-y")
  screenQuestion: string
  boardController: string (socket id)
  boardControllerNickname: string
   */

  if (isHost) {
    clearPlayerAnswerText();
    playAudio("daily_double");
    displayClue(clueRequest, screenQuestion, true);
    currentScreenQuestion = screenQuestion;
    setTimeout(function() {
      socket.emit("daily_double")
    }, 3000);
  } else {
    if (joined) {
      if (socket.id == boardController) {
        changeWaitScreen("SCREEN", false);
      } else {
        changeWaitScreen(boardControllerNickname.toUpperCase(), false);
      }
    }
  }
});

// HOST & CONTROLLER
socket.on("request_daily_double_wager", function(categoryName, player, newMaxWager) {
  /*
  Input:
  categoryName: string
  player: object (player)
  newMaxWager: number
   */

  dailyDouble = true;
  if (isHost) {
    startTimerAnimation(15);
    requestDailyDoubleWager(categoryName, player.nickname, player.score);
  } else {
    if (joined) {
      if (socket.id == player.id) {
        toggleWagerForm(true);
        changeScreen("answer-screen");
        startTimerAnimation(15);
        maxWager = newMaxWager;
        startWagerLivefeedInterval();
        scrapeWagerTimeout = setTimeout(function() {
          submitWager(true);
        }, 15000);
      }
    }
  }
});

socket.on("display_daily_double_clue", function(screenQuestion) {
  /*
  Input:
  screenQuestion: string
   */

  if (isHost) {
    disableTimer();

    let clueText = document.getElementById("clue-text");

    clueText.innerHTML = screenQuestion;
    adjustClueFontSize(screenQuestion, false);

    voice(screenQuestion, .1);
    setTimeout(startQuestionInterval, 2000);
    clearPlayerAnswerText();

    document.getElementById("player-livefeed-wrapper").classList.add("inactive");
  }
});

// HOST & CONTROLLER
socket.on("answer_daily_double", function(player) {
  /*
  Input:
  player: object (player)
   */

  try {
    clearTimeout(timerTimeout);
  } catch (e) {}

  buzzWinner = player;

  if (isHost) {
    startTimerAnimation(15);
    setupPlayerLivefeed(player, currentScreenQuestion);
    clearPlayerAnswerText();
  } else {
    if (joined) {
      if (socket.id == player.id) {
        disableTimer();
        startTimerAnimation(15);
        scrapeAnswerTimeout = setTimeout(submitAnswer, 15000);
        changeScreen("answer-screen");
        toggleWagerForm(false);
        startLivefeedInterval();
      } else {
        changeWaitScreen(player.nickname, false);
      }
    }
  }
});

// HOST & CONTROLLER
socket.on("buzzers_ready", function(playersAnswered) {
  /*
  Input:
  playersAnswered: array of strings (socket ids)
   */

  if (isHost) {
    startTimerAnimation(5);
    if (playersAnswered.length > 0) {
      document.getElementById("clue-text").innerHTML = currentScreenQuestion;
      adjustClueFontSize(currentScreenQuestion, false);
      clearPlayerAnswerText();
    }
  } else {
    if (joined) {
      if (playersAnswered.includes(socket.id)) {
        changeWaitScreen("OTHER PLAYERS", false);
      } else {
        changeScreen("buzzer-screen");
        toggleBlinkingBuzzerLight(true);
        startTimerAnimation(5);
      }
    }
  }
});

// HOST & CONTROLLER
socket.on("answer", function(player) {
  /*
  Input:
  player: object (player)
   */

  try {
    clearTimeout(timerTimeout);
  } catch (e) {}

  buzzWinner = player;

  disableTimer();
  // Extra .5 seconds is to accomodate the .5 seconds that the buzzer
  // blinker shows either green or red depending on if the player won the buzz
  startTimerAnimation(15.5);

  if (isHost) {
    playAudio("buzzer");
    setupPlayerLivefeed(buzzWinner, currentScreenQuestion);
    clearPlayerAnswerText();
  } else {
    if (joined) {
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
          changeWaitScreen(player.nickname, false);
          changeBuzzerLightColor(false, false);
        }, 500);
      }
    }
  }
});

// HOST
socket.on("livefeed", function(livefeed) {
  /*
  Input:
  livefeed: string
   */

  if (isHost) {
    if (!finalJeoparty) {
      document.getElementById("player-livefeed").innerHTML = livefeed.toUpperCase();
    }
  }
});

// HOST
socket.on("wager_livefeed", function(wagerLivefeed) {
  /*
  Input:
  wagerLivefeed: number
   */

  if (isHost) {
    if (dailyDouble) {
      let wager;

      if (wagerLivefeed.length == "") {
        wager = "0";
      } else {
        wager = wagerLivefeed;
      }
      document.getElementById("player-livefeed").innerHTML = "$" + wager.toUpperCase();
    }
  }
});

// HOST & CONTROLLER
socket.on("answer_submitted", function(answer, correct) {
  /*
  Input:
  answer: string
  correct: boolean
   */

  disableTimer();
  if (isHost) {
    displayPlayerAnswer(buzzWinner, answer, correct);
  } else {
    if (joined) {
      changeWaitScreen("SCREEN", false);
    }
  }
});

// HOST & CONTROLLER
socket.on("display_correct_answer", function(correctAnswer, timesUp) {
  /*
  Input:
  correctAnswer: string
  timesUp: boolean
   */

  if (isHost) {
    if (timesUp) {
      playAudio("times_up");
    }
    voice(getRandomAnswerIntro() + correctAnswer, .5);
    displayCorrectAnswer(correctAnswer);
  } else {
    if (joined) {
      if (timesUp) {
        toggleBlinkingBuzzerLight(false);
      }
      changeWaitScreen("SCREEN", false);
    }
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

// HOST & CONTROLLER
socket.on("reveal_board", function(newUsedClueArray, boardController, boardControllerNickname) {
  /*
  Input:
  newUsedClueArray: array of strings ("category-x-price-y")
  boardController: string (socket id)
  boardControllerNickname: string
   */

  if (!finalJeoparty) {
    dailyDouble = false;

    if (isHost) {
      changeScreen("h-board-screen");
      document.getElementById("clue-screen").classList.remove("animate");
      voice(getRandomBoardControllerIntro() + boardControllerNickname, .1);
    } else {
      if (joined || waitingToJoin) {
        waitingToJoin = false;
        joined = true;

        if (socket.id == boardController) {
          changeScreen("c-board-screen");
          resetClueButtons();
          resetCluePriceButtons();
        } else {
          changeWaitScreen(boardControllerNickname.toUpperCase(), false);
        }
      }
    }
    usedClueArray = newUsedClueArray;
    updateCategoryOptions();
  }
});

// HOST & CONTROLLER
socket.on("setup_double_jeoparty", function(categoryNames, categoryDates) {
  /*
  Input:
  categoryNames: array of strings
  categoryDates: array of numbers
   */

  setDoubleJeopartyPriceText();
  setCategoryText(categoryNames, categoryDates);
  if (isHost) {
    clearPlayerAnswerText();
  }
});

// HOST & CONTROLLER
socket.on("setup_final_jeoparty", function(clue) {
  /*
   */

  finalJeoparty = true;
  finalJeopartyClue = clue;

  let categoryName = clue["category"]["title"];

  if (isHost) {
    document.getElementById("clue-screen").className = "static-clue-screen";
    currentScreenId = "clue-screen";
    voice(getRandomFinalJeopartyIntro());
    document.getElementById("clue-text").innerHTML = "";
    clearPlayerAnswerText();
    setTimeout(function() {
      playAudio("final_jeoparty_category");
      voice(categoryName);
      displayFinalJeopartyCategory(categoryName);
      setTimeout(function() {
        socket.emit("displayed_final_jeoparty_category");
      }, 3000);
    }, 3000);
  } else {
    if (joined) {
      changeWaitScreen("SCREEN", false);
    }
  }
});

socket.on("request_final_jeoparty_wager", function(finalJeopartyPlayers) {
  if (isHost) {
    startTimerAnimation(15);
    changeScreen("score-screen");
    changeTimerHeight(true);
  } else {
    if (joined) {
      if (Object.keys(finalJeopartyPlayers).includes(socket.id)) {
        finalJeopartyPlayer = true;
        toggleWagerForm(true);
        startWagerLivefeedInterval();
        changeScreen("answer-screen");
        startTimerAnimation(15);
        maxWager = finalJeopartyPlayers[socket.id].maxWager;
        scrapeWagerTimeout = setTimeout(function() {
          submitWager(true);
        }, 15000);
      } else {
        changeWaitScreen("BANKRUPT", true);
      }
    }
  }
});

socket.on("display_final_jeoparty_clue", function() {
  if (isHost) {
    changeScreen("clue-screen");
    changeTimerHeight(false);

    disableTimer();

    let clueText = document.getElementById("clue-text");
    let screenQuestion = finalJeopartyClue["screen_question"];

    clueText.innerHTML = screenQuestion;
    adjustClueFontSize(screenQuestion, false);

    voice(screenQuestion, .1);
    setTimeout(startQuestionInterval, 2000);
    clearPlayerAnswerText();

    document.getElementById("player-livefeed-wrapper").classList.add("inactive");
  } else {
    if (joined) {
      if (finalJeopartyPlayer) {
        toggleWagerForm(false);
        changeWaitScreen("SCREEN", false);
      }
    }
  }
});

socket.on("answer_final_jeoparty", function() {
  if (isHost) {
    playAudio("think_music");
    startTimerAnimation(30);
  } else {
    if (joined) {
      if (finalJeopartyPlayer) {
        startTimerAnimation(30);
        changeScreen("answer-screen");
        startLivefeedInterval();
      }
    }
  }
});

socket.on("display_final_jeoparty_answer", function(players) {
  if (isHost) {
    disableTimer();

    displayFinalJeopartyAnswers(players);
  } else {
    if (joined) {
      if (finalJeopartyPlayer) {
        disableTimer();
        changeWaitScreen("SCREEN");
      }
    }
  }
});

// Game logic

// HOST
function declareAudioFiles() {
  /*
  Result:
  Declares every audio file used throughout the game. This needs to be called
  by a user input in order for the browser to allow any audio to be played
   */

  audioAllowed = true;
  audioFiles = {
    "landing_screen_theme": new Audio("/audio/landing_screen_theme.mp3"),
    "clue_selected": new Audio("/audio/clue_selected.mp3"),
    "buzzer": new Audio("/audio/buzzer.mp3"),
    "times_up": new Audio("/audio/times_up.mp3"),
    "applause": new Audio("/audio/applause.mp3"),
    "aww": new Audio("/audio/aww.mp3"),
    "daily_double": new Audio("/audio/daily_double.mp3"),
    "final_jeoparty_category": new Audio("/audio/final_jeoparty_category.mp3"),
    "think_music": new Audio("/audio/think_music.mp3"),
    "big_applause": new Audio("/audio/big_applause.mp3"),
  };

  if (currentScreenId == "h-landing-screen") {
    playAudio("landing_screen_theme");
  }
}

// HOST
function playAudio(filename) {
  /*
  Input:
  filename: string (audio filename)

  Result:
  Plays filename's audio clip
   */

  if (audioAllowed) {
    if (audioFiles[filename].paused) {
      audioFiles[filename].play();
    }
  }
}

function toggleRejoinGameButton(on) {
  let startGameButton = document.getElementById("start-game-button");
  let rejoinGameButton = document.getElementById("rejoin-game-button");

  if (on) {
    startGameButton.classList.add("inactive");
    rejoinGameButton.classList.remove("inactive");
  } else {
    startGameButton.classList.remove("inactive");
    rejoinGameButton.classList.add("inactive");
  }
}

function rejoinGame() {
  socket.emit("rejoin_game");
  nosleep.enable();
}

// CONTROLLER
function joinGame() {
  /*
  Result:
  Sends the player's custom nickname and signature to the server
   */

  let nickname = document.getElementById("nickname-form").value;
  let signature = document.getElementById("sketchpad").toDataURL("image/png");

  if (nickname.length <= 25) {
    socket.emit("join_game", nickname, signature);
    nosleep.enable();
  } else {
    alert("Your nickname is too long");
  }
}

// HOST
function setCategoryText(categoryNames, categoryDates) {
  /*
  Input:
  categoryNames: array of strings
  categoryDates: array of numbers

  Result:
  Displays each category name and date in the appropriate box on the board screen
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

// CONTROLLER
function startGame() {
  /*
  Result:
  Signals the server to begin the game
   */

  let start = confirm("Are you sure everyone is connected to the game?");

  if (start) {
    socket.emit("start_game");
  }
}

// HOST & CONTROLLER
function changeScreen(newScreen) {
  /*
  Input:
  newScreen: string (element id)

  Result:
  Disables the current screen element and enables newScreen
   */

  document.getElementById(currentScreenId).classList.add("inactive");
  document.getElementById(newScreen).classList.remove("inactive");
  currentScreenId = newScreen;
}

// HOST
function voice(text, delay) {
  /*
  Input:
  text: string
  delay: number

  Result:
  Uses the browser's built-in speech synthesis to speak text out loud
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

// HOST
function startQuestionInterval() {
  /*
  Result:
  Starts interval to check if the question is done being read by text to speech
   */

  questionInterval = setInterval(function() {
    if (!window.speechSynthesis.speaking) {
      clearInterval(questionInterval);
      if (dailyDouble) {
        socket.emit("answer_daily_double");
      } else if (finalJeoparty) {
        socket.emit("answer_final_jeoparty");
      } else {
        socket.emit("activate_buzzers");
      }
    }
  }, 1);
}

// CONTROLLER
function changeWaitScreen(waitingFor, override) {
  /*
  Input:
  waitingFor: string
  override: boolean

  Result:
  Displays the waiting screen and shows who is being waited for
   */

  let prefix;

  if (override) {
    prefix = "";
  } else {
    prefix = "WAITING FOR ";
  }

  if (currentScreenId != "c-waiting-screen") {
    document.getElementById(currentScreenId).classList.add("inactive");
    document.getElementById("c-waiting-screen").classList.remove("inactive");

    currentScreenId = "c-waiting-screen";
  }

  document.getElementById("c-waiting-screen-text").innerHTML = prefix + waitingFor.toUpperCase();
}

// CONTROLLER
function adjustMobileStyle() {
  /*
  Result:
  Changes the styling of controller screens to fit with the device's screen size
   */

  document.body.style.position = "fixed";

  let gameScreenIds = ["c-landing-screen", "c-waiting-screen", "start-game-screen", "c-board-screen", "buzzer-screen", "answer-screen"];

  for (let i = 0; i < gameScreenIds.length; i++) {
    // This is neccessary because 100vh on iOS Safari extends past the visible
    // screen area which makes the player swipe up and down to play the game
    document.getElementById(gameScreenIds[i]).style.height = window.innerHeight + "px";
  }

  for (let j = 1; j <= 5; j++) {
    document.getElementById("c-board-row" + "-" + j).style.height = (window.innerHeight / 5) + "px";
  }

  document.getElementById("erase").style.left = (((window.innerWidth - 250) / 2) + 220) + "px";
}

// CONTROLLER
function pressClueButton(button) {
  /*
  Input:
  button: HTML element

  Result:
  Highlights the button that was pressed and un-highlights the last button of
  that type to be pressed
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

// HOST & CONTROLLER
function updateCategoryOptions() {
  /*
  Result:
  Removes the categoryName on the board screen of any completed category
   */

  let idSuffix;

  if (isHost) {
    idSuffix = "-name";
  } else {
    idSuffix = "-text";
  }

  for (let i = 1; i < 7; i++) {
    let categoryButton = document.getElementById("category-" + i);
    let categoryButtonText = document.getElementById("category-" + i + idSuffix);

    if (usedClueArray["category-" + i].length == 5) {
      categoryButton.disabled = true;
      categoryButtonText.innerHTML = "";

      if (isHost) {
        document.getElementById("category-" + i + "-date-wrapper").className = "inactive category-date-wrapper";
      }
    } else {
      categoryButton.disabled = false;

      if (isHost) {
        document.getElementById("category-" + i + "-date-wrapper").className = "category-date-wrapper";
      }
    }
  }
}

// CONTROLLER
function updateClueOptions(categoryId) {
  /*
  Input:
  categoryId: string ("category-x")

  Result:
  Removes the option to select certain price values depending on the category
  that the player pressed

  i.e. if the $200 and $400 question in Category 1 have been selected already,
  the only options available for the player to use are $600, $800, and $1000
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

// CONTROLLER
function resetCluePriceButtons() {
  /*
  Result:
  Activates and resets the text of every clue price button
  on the controller board screen. This is to make the board screen
  a blank slate for the player's selection
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

// HOST
function getRandomBoardControllerIntro() {
  /*
  Output:
  Returns a random string from intros for the text to speech say before
  asking the board controller to select a clue. A full text to speech statement
  would sound like, "Pick a category nickname"
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

// CONTROLLER
function sendClueRequest() {
  /*
  Result:
  Sends the requested clue to the server
   */

  if (lastCategoryId != undefined && lastPriceId != undefined) {
    let clueRequest = lastCategoryId + "-" + lastPriceId;
    socket.emit("request_clue", clueRequest);

    lastCategoryId = undefined;
    lastPriceId = undefined;
  }
}

// HOST
function displayClue(clueRequest, screenQuestion, dailyDouble) {
  /*
  Input:
  clueRequest: string ("category-x-price-y")
  screenQuestion: string
  dailyDouble: boolean

  Result:
  Highglights the clue element on the host board screen then animates the
  clue screen to appear overtop of the board
   */

  let clueElement = document.getElementById(clueRequest);

  moveClueScreen(clueRequest);

  let clueText = document.getElementById("clue-text");

  if (dailyDouble) {
    document.getElementById(clueRequest + "-text").innerHTML = "";

    document.getElementById("daily-double-wrapper").className = "daily-double-wrapper-screen";
    document.getElementById("clue-screen").className = "daily-double-screen";

    setTimeout(animateClueScreen, 10);

    clueText.className = "daily-double-text";
    clueText.innerHTML = "DAILY DOUBLE";
  } else {
    clueElement.classList.add("highlighted");

    clueText.innerHTML = screenQuestion;
    adjustClueFontSize(screenQuestion, false);
  }

  if (!dailyDouble) {
    setTimeout(function() {
      document.getElementById(clueRequest + "-text").innerHTML = "";
      clueElement.classList.remove("highlighted");
      document.getElementById("clue-screen").classList.remove("inactive");
      setTimeout(animateClueScreen, 10);
    }, 1000);
  }
}

// HOST
function adjustClueFontSize(question, livefeed) {
  /*
  Input:
  question: string
  livefeed: boolean

  Result:
  Adjusts the font size of the clue depending on how long it is,
  and whether or not it is being displayed on top of a livefeed or not
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

// HOST
function moveClueScreen(clueRequest) {
  /*
  Input:
  clueRequest: string ("category-x-price-y")

  Result:
  Changes the position of the clue screen to be above the clue element
  of the clue that was selected
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

// HOST
function animateClueScreen() {
  /*
  Result:
  Animates the rapid scaling and opacity increase of the clue screen
   */

  let clueScreen = document.getElementById("clue-screen");
  clueScreen.style.left = "0vw";
  clueScreen.style.bottom = "0vh";
  clueScreen.classList.add("animate");
}

// CONTROLLER
function toggleWagerForm(on) {
  /*
  Input:
  on: boolean

  Result:
  If on is true, this activates the wager form, else it is deactivated
   */

  let answerFormWrapper = document.getElementById("answer-form-wrapper");
  let wagerFormWrapper = document.getElementById("wager-form-wrapper");

  if (on) {
    answerFormWrapper.classList.add("inactive");
    wagerFormWrapper.classList.remove("inactive");
  } else {
    answerFormWrapper.classList.remove("inactive");
    wagerFormWrapper.classList.add("inactive");

    document.getElementById("submit-wager-button").classList.add("inactive");
  }
}

// HOST
function requestDailyDoubleWager(categoryName, nickname, score) {
  /*
  Input:
  categoryName: string
  nickname: string
  score: number

  Result:
  Displays some important data on the clue screen while the daily double
  winner is deciding their wager
   */

  document.getElementById("daily-double-wrapper").className = "";
  document.getElementById("clue-screen").className = "clue-screen animate";

  let clueText = document.getElementById("clue-text");
  clueText.className = "xs-clue-text";

  clueText.innerHTML = "CATEGORY:<br>" + categoryName.toUpperCase();

  if (score < 0) {
    clueText.innerHTML += "<br>" + nickname.toUpperCase() + "'S MONEY:<br>-$" + Math.abs(score);
  } else {
    clueText.innerHTML += "<br>" + nickname.toUpperCase() + "'S MONEY:<br>$" + score;
  }

  document.getElementById("player-livefeed-spacer").style.height = "6vh";
  document.getElementById("player-livefeed-wrapper").classList.remove("inactive");
  document.getElementById("player-livefeed-nickname").innerHTML = nickname.toUpperCase() + ":<br>";
}

// CONTROLLER
function startWagerLivefeedInterval() {
  /*
  Result:
  Starts interval to send the player's wager form to the server as they are typing
   */

  let wagerForm = document.getElementById("wager-form");

  wagerLivefeedInterval = setInterval(function() {
    socket.emit("wager_livefeed", wagerForm.value);
    if (wagerForm.value.length > 0) {
      document.getElementById("submit-wager-button").classList.remove("inactive");
    }
  }, 1);
}

// CONTROLLER
function submitWager(timesUp) {
  /*
  Input:
  timesUp: boolean

  Result:
  Sends the player's wager to the server if it meets certain criteria
   */

  let wagerForm = document.getElementById("wager-form");
  let wager = wagerForm.value;

  let minWager;

  if (dailyDouble) {
    minWager = 5;
  } else {
    minWager = 0;
  }

  if (timesUp) {
    try {
      clearInterval(wagerLivefeedInterval);
    } catch (e) {}
    clearTimeout(scrapeWagerTimeout);
    if (finalJeoparty) {
      changeWaitScreen("OTHER PLAYERS", false);
    } else {
      changeWaitScreen("SCREEN", false);
    }
    if (!isNaN(wager) && Number(wager) > minWager && Number(wager) < maxWager) {
      if (dailyDouble) {
        socket.emit("daily_double_wager", Number(wager));
      } else {
        socket.emit("final_jeoparty_wager", Number(wager));
      }
    } else {
      if (dailyDouble) {
        socket.emit("daily_double_wager", minWager);
      } else {
        socket.emit("final_jeoparty_wager", minWager);
      }
    }
    wagerForm.value = "";
  } else {
    if (isNaN(wager)) {
      alert("Enter a number");
    } else {
      if (Number(wager) < minWager) {
        alert("Minimum wager is $" + minWager);
      } else if (Number(wager) > maxWager) {
        alert("Maximum wager is $" + maxWager);
      } else {
        try {
          clearInterval(wagerLivefeedInterval);
        } catch (e) {}
        clearTimeout(scrapeWagerTimeout);
        if (dailyDouble) {
          socket.emit("daily_double_wager", Number(wager));
        } else {
          socket.emit("final_jeoparty_wager", Number(wager));
        }
        if (finalJeoparty) {
          changeWaitScreen("OTHER PLAYERS", false);
        } else {
          changeWaitScreen("SCREEN", false);
        }
        wagerForm.value = "";
      }
    }
  }
}

// HOST & CONTROLLER
function startTimerAnimation(time) {
  /*
  Input:
  time: number

  Result:
  Activates the timer and timer frame elements, then animates the timer
  decreasing over the given time period
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

// HOST & CONTROLLER
function disableTimer() {
  /*
  Result:
  Disables the timer and timer frame elements
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

// CONTROLLER
function toggleBlinkingBuzzerLight(blinking) {
  /*
  Input:
  blinking: boolean

  Result:
  If blinking is true, enables the blinking light, else, disables
  the blinking light
   */

  let blinkingBuzzerLight = document.getElementById("blinking-buzzer-light");

  if (blinking) {
    blinkingBuzzerLight.classList.remove("inactive");
  } else {
    blinkingBuzzerLight.classList.add("inactive");
  }
}

// CONTROLLER
function changeBuzzerLightColor(active, correct) {
  /*
  Input:
  active: boolean
  correct: boolean

  Result:
  Enables or disables the buzzer light depending on active, then changes
  it to green or red depending on correct
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

// CONTROLLER
function buzz() {
  /*
  Result:
  Sends a signal to the server that this device buzzed in to answer the clue
   */

  socket.emit("buzz");
  try {
    clearTimeout(scrapeAnswerTimeout);
  } catch (e) {}
  scrapeAnswerTimeout = setTimeout(submitAnswer, 15500);
}

// HOST
function setupPlayerLivefeed(player, screenQuestion) {
  /*
  Input:
  player: object (player)
  screenQuestion: string

  Result:
  Organizes the screen so that the clue text is formatted clearly for the
  livefeed to appear on the bottom of the clue screen
   */

  adjustClueFontSize(screenQuestion, true);

  document.getElementById("player-answer").innerHTML = "";
  document.getElementById("player-livefeed-wrapper").classList.remove("inactive");
  document.getElementById("player-livefeed-nickname").innerHTML = player.nickname.toUpperCase() + ":<br>";
  document.getElementById("player-livefeed").innerHTML = "";
}

// HOST
function startLivefeedInterval() {
  /*
  Result:
  Starts interval to send the player's answer form to the server as they are typing
   */

  let answerForm = document.getElementById("answer-form");

  livefeedInterval = setInterval(function() {
    socket.emit("livefeed", answerForm.value);
    if (answerForm.value.length > 0) {
      document.getElementById("submit-answer-button").classList.remove("inactive");
    }
  }, 1);
}

// CONTROLLER
function submitAnswer() {
  /*
  Result:
  Sends the player's answer to the server
   */

  let answerForm = document.getElementById("answer-form");

  clearInterval(livefeedInterval);
  try {
    clearTimeout(scrapeAnswerTimeout);
  } catch (e) {}

  document.getElementById("submit-answer-button").className = "inactive submit-answer-button";

  if (dailyDouble) {
    socket.emit("submit_daily_double_answer", answerForm.value);
  } else if (finalJeoparty) {
    socket.emit("submit_final_jeoparty_answer", answerForm.value);
  } else {
    socket.emit("submit_answer", answerForm.value);
  }

  answerForm.value = "";

  if (finalJeoparty) {
    changeWaitScreen("OTHER PLAYERS", false);
  } else {
    changeWaitScreen("SCREEN", false);
  }
}

// HOST
function displayPlayerAnswer(player, answer, correct) {
  /*
  Input:
  player: object (player)
  answer: string
  correct: boolean

  Result:
  Displays the player's answer on screen and changes its color to either
  green or red depending on correct
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

// HOST
function getRandomAnswerIntro() {
  /*
  Output:
  Returns a random string from intros for the text to speech say before
  stating the correct answer to the clue. A full text to speech statement
  would sound like, "The correct answer is something"
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

// HOST
function displayCorrectAnswer(correctAnswer) {
  /*
  Input:
  correctAnswer: string

  Result:
  Displays the correct answer to the clue on screen
   */

  document.getElementById("clue-text").className = "clue-text";
  document.getElementById("clue-text").innerHTML = "CORRECT RESPONSE:<br>";

  let playerAnswer = document.getElementById("player-answer");
  playerAnswer.classList.remove("inactive");
  playerAnswer.style.transitionDuration = "0s";
  playerAnswer.style.color = "white";
  playerAnswer.innerHTML = correctAnswer.toUpperCase();
}

// HOST
function clearPlayerAnswerText() {
  /*
  Result:
  Deactivates and empties the text inside of the player-answer element
   */

  let playerAnswer = document.getElementById("player-answer");
  playerAnswer.className = "inactive clue-text"
  playerAnswer.innerHTML = "";
  playerAnswer.style.color = "white";
}

// CONTROLLER
function resetClueButtons() {
  /*
  Result:
  Unhighlights any board buttons that were highlighted
   */

  // Player's wrapper variables may still be undefined
  try {
    document.getElementById(lastCategoryWrapperId).classList.remove("highlighted");
    document.getElementById(lastPriceWrapperId).classList.remove("highlighted");
  } catch (e) {}
}

// HOST
function updateScoreboard(players) {
  /*
  Input:
  players: array of objects (players)

  Result:
  Updates the HTML elements of the scoreboard to reflect the new scores
  and/or positions of each player
   */

  let clone = JSON.parse(JSON.stringify(players));

  let playersLength = Object.keys(clone).length;

  let podiumOne = document.getElementById("podium-1");
  let podiumTwo = document.getElementById("podium-2");
  let podiumThree = document.getElementById("podium-3");
  let overflowRow = document.getElementById("overflow-row");
  let overflow = document.getElementById("overflow-text");

  overflowRow.className = "inactive row overflow-row";
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
    overflowRow.classList.remove("inactive");

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

// HOST & CONTROLLER
function setDoubleJeopartyPriceText() {
  /*
  Result:
  Change the dollar value text on each board scree to show the doubled amounts
  available in Double Jeoparty
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

function changeTimerHeight(half) {
  /*
   */

  let newHeight;

  if (half) {
    newHeight = "5vh";
  } else {
    newHeight = "10vh";
  }

  document.getElementById("h-timer").style.height = newHeight;
  document.getElementById("h-timer-frame").style.height = newHeight;
  for (let i = 1; i <= 8; i++) {
    document.getElementById("divider-" + i).style.height = newHeight;
  }
}

// HOST
function getRandomFinalJeopartyIntro() {
  /*
   */

  let intros = [
    "The final jeoparty category is ",
  ];

  let intro = intros[Math.floor(Math.random() * intros.length)];

  return intro;
}

function displayFinalJeopartyCategory(categoryName) {
  /*
   */

  let clueText = document.getElementById("clue-text");
  clueText.className = "clue-text";

  clueText.innerHTML = categoryName.toUpperCase();
}

function displayFinalJeopartyAnswers(players) {
  /*
   */

  let clone = JSON.parse(JSON.stringify(players));

  let keys = Object.keys(clone);

  keys.sort(function(a, b) {
    return clone[a].score - clone[b].score;
  });

  let playerIds = keys;

  let clueText = document.getElementById("clue-text");
  clueText.classList = "clue-text";
  let playerAnswer = document.getElementById("player-answer");
  playerAnswer.className = "player-answer";

  let i = 0;

  displayFinalJeopartyAnswer();

  function displayFinalJeopartyAnswer() {
    /*
     */

    let nickname, wager, answer, correct;

    nickname = players[playerIds[i]].nickname.toUpperCase();
    wager = players[playerIds[i]].wager;
    answer = players[playerIds[i]].answer.toUpperCase();
    correct = players[playerIds[i]].correct;

    clueText.innerHTML = nickname + "'S WAGER:<br>$" + wager + "<br><br>";
    clueText.innerHTML += nickname + "'S RESPONSE: <br>";

    playerAnswer.style.transitionDuration = "0s";
    playerAnswer.style.color = "white";
    playerAnswer.innerHTML = answer;

    setTimeout(function() {
      playerAnswer.style.transitionDuration = "2s";
      if (correct) {
        playAudio("applause");
        playerAnswer.style.color = "#39FF14";
      } else {
        playAudio("aww");
        playerAnswer.style.color = "red";
      }
    }, 1000);

    i++;

    if (i == playerIds.length) {
      setTimeout(function() {
        endGame(nickname);
      }, 5000);
    } else {
      setTimeout(displayFinalJeopartyAnswer, 5000);
    }
  }

  function endGame(nickname) {
    socket.emit("request_players");

    let correctAnswer = finalJeopartyClue["screen_answer"].toUpperCase();

    clueText.innerHTML = "CORRECT RESPONSE:<br>";

    playerAnswer.style.transitionDuration = "0s";
    playerAnswer.style.color = "white";
    playerAnswer.innerHTML = correctAnswer;

    voice(getRandomAnswerIntro() + correctAnswer, .5);

    setTimeout(function() {
      updateScoreboard(players);
      changeScreen("score-screen");
      setTimeout(function() {
        changeScreen("clue-screen");
        clearPlayerAnswerText();
        clueText.innerHTML = "CONGRATULATIONS<br>" + nickname + "!";
        playAudio("big_applause");
        setTimeout(function() {
          clueText.innerHTML = "THANKS FOR PLAYING!";
          playAudio("landing_screen_theme");
        }, 10000);
      }, 4000);
    }, 4000);
  }
}
},{"nosleep.js":1}]},{},[2]);
