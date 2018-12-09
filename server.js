"use strict";

// Socket.io functions

// Setup basic express server
let express = require("express");
let app = express();
let path = require("path");
let server = require("http").createServer(app);
let io = require("socket.io")(server);

// Turn on server port
server.listen(3000, "18.40.44.75");

// Direct static file route to public folder
app.use(express.static(path.join(__dirname, "public")));

let hostSocket = undefined;
let players = {};
let boardController;
let lastClueRequest;
let playersAnswered = [];
let buzzersReady = false;
let answerReady = false;
let buzzWinnerId;
let usedClueIds = [];
let usedClueArray = {
  "category-1": [],
  "category-2": [],
  "category-3": [],
  "category-4": [],
  "category-5": [],
  "category-6": [],
};

// Timeout/interval handlers
let buzzerTimeout;
let answerTimeout;

io.on("connection", function(socket) {
  socket.join("session");

  socket.emit("connect_device");

  socket.on("set_host_socket", function() {
    getCategories();
    hostSocket = socket;
  });

  socket.on("join_game", function() {
    let player = new Object();
    player.playerNumber = Object.keys(players).length + 1;
    player.nickname = "default";
    player.score = 0;

    players[socket.id] = player;

    if (Object.keys(players).length == 1) {
      boardController = socket.id;
    }

    socket.emit("join_success", categoryNames, boardController);
    io.in("session").emit("players", players);
  });

  socket.on("start_game", function() {
    io.in("session").emit("load_game", categoryNames, boardController, players[boardController].nickname);
  });

  socket.on("request_clue", function(clueRequest) {
    io.in("session").emit("display_clue", clueRequest, clues[clueRequest]["screen_question"]);

    usedClueIds.push(clueRequest);
    usedClueArray[clueRequest.slice(0, 10)].push(clueRequest.slice(11));

    lastClueRequest = clueRequest;

    setTimeout(function() {
      io.in("session").emit("buzzers_ready");
      buzzersReady = true;

      // Safety buzz timer
      buzzerTimeout = setTimeout(function() {
        buzzersReady = false;
        io.in("session").emit("display_correct_answer", clues[lastClueRequest]["screen_answer"]);
        setTimeout(function() {
          io.in("session").emit("reveal_scores");
          reset();
          setTimeout(function() {
            io.in("session").emit("reveal_board", usedClueArray, boardController, players[boardController].nickname);
          }, 5000);
        }, 5000);
      }, 5000);
    }, 3000);
  });

  socket.on("buzz", function() {
    if (buzzersReady) {
      clearTimeout(buzzerTimeout);

      buzzWinnerId = socket.id;
      buzzersReady = false;
      answerReady = true;
      io.in("session").emit("answer", players[buzzWinnerId]);

      // Safety answer timer
      answerTimeout = setTimeout(function() {
        answerReady = false;
        io.in("session").emit("answer_submitted", ["", false]);
      }, 16000);
    }
  });

  socket.on("livefeed", function(livefeed) {
    io.in("session").emit("livefeed", livefeed);
  });

  socket.on("submit_answer", function(answer) {
    if (answerReady) {
      clearTimeout(answerTimeout);
      answerReady = false;
      playersAnswered.push(socket.id);

      let correct = evaluateAnswer(answer);

      updateScore(socket.id, correct, lastClueRequest[lastClueRequest.length - 1]);

      io.in("session").emit("answer_submitted", answer, correct);
      io.in("session").emit("players", players);

      setTimeout(function() {
        if (correct) {
          io.in("session").emit("reveal_scores");
          reset();
          setTimeout(function() {
            io.in("session").emit("reveal_board", usedClueArray, boardController, players[boardController].nickname);
          }, 5000);
        } else if (playersAnswered.length == Object.keys(players).length) {
          io.in("session").emit("display_correct_answer", clues[lastClueRequest]["screen_answer"]);
          setTimeout(function() {
            io.in("session").emit("reveal_scores");
            reset();
            setTimeout(function() {
              io.in("session").emit("reveal_board", usedClueArray, boardController, players[boardController].nickname);
            }, 5000);
          }, 5000);
        } else {
          io.in("session").emit("buzzers_ready");
          buzzersReady = true;

          // Safety buzz timer
          buzzerTimeout = setTimeout(function() {
            buzzersReady = false;
            io.in("session").emit("display_correct_answer", clues[lastClueRequest]["screen_answer"]);
            setTimeout(function() {
              io.in("session").emit("reveal_scores");
              reset();
              setTimeout(function() {
                io.in("session").emit("reveal_board", usedClueArray, boardController, players[boardController].nickname);
              }, 5000);
            }, 5000);
          }, 5000);
        }
      }, 5000);
    }
  });

  socket.on("disconnecting", function() {
    socket.leave("session");
    delete players[socket.id];
    io.in("session").emit("players", players);
  });
});

// Jeoparty! functions

let js = require("jservice-node");

let categoryNames = [];
let clues = {};

function getCategories() {
  /*
   */

  let usedCategoryIds = [];

  for (let i = 0; i < 20; i++) {
    let categoryId = Math.floor(Math.random() * 18418) + 1;

    let options = {
      category: categoryId,
    };

    js.clues(options, function(error, response, json) {
      if (!error && response.statusCode == 200 && !usedCategoryIds.includes(categoryId) && approveCategory(json)) {
        usedCategoryIds.push(categoryId);
        loadCategory(json);
      }
    });
  }
}

function approveCategory(category) {
  /*
   */

  for (let i = 0; i < 5; i++) {
    if (category[i]["invalid_count"] != null) {
      return false;
    }
  }
  return true;
}

function loadCategory(category) {
  /*
   */

  if (categoryNames.length < 6) {
    categoryNames.push(category[0]["category"]["title"]);

    for (let i = 1; i < 6; i++) {
      let id = "category-" + categoryNames.length + "-price-" + i;

      clues[id] = category[i - 1];
      clues[id]["screen_question"] = formatScreenQuestion(clues[id]["question"]);
      clues[id]["raw_answer"] = formatRawText(clues[id]["answer"]);
      clues[id]["screen_answer"] = formatScreenAnswer(clues[id]["answer"]);
    }
  }
}

function formatScreenQuestion(original) {
  /*
   */

  let formattedQuestion = original.toUpperCase();
  return (formattedQuestion);
}

function formatRawText(original) {
  /*
   */

  let rawAnswer = original.toLowerCase();

  rawAnswer = rawAnswer + " ";

  // HTML tags
  rawAnswer = rawAnswer.replace(/<i>/g, "");
  rawAnswer = rawAnswer.replace("</i>", "");

  // Punctuation
  rawAnswer = rawAnswer.replace(/[.,\/#!$%\^&\*;:"'{}=\-_`~()]/g, " ");
  rawAnswer = rawAnswer.replace(/\s{2,}/g, " ");
  rawAnswer = rawAnswer.replace(String.fromCharCode(92), "");

  // Red words
  rawAnswer = rawAnswer.replace(/and /g, "");
  rawAnswer = rawAnswer.replace(/the /g, "");
  rawAnswer = rawAnswer.replace(/a /g, "");
  rawAnswer = rawAnswer.replace(/an /g, "");

  // Spacing
  rawAnswer = rawAnswer.replace(/ /g, "");

  return (rawAnswer);
}

function formatScreenAnswer(original) {
  /*
   */

  // Uppercase everything
  let screenAnswer = original.toUpperCase();

  // Backslashes
  screenAnswer = screenAnswer.replace(String.fromCharCode(92), "");

  // HTML tags
  screenAnswer = screenAnswer.replace(/<I>/g, "");
  screenAnswer = screenAnswer.replace("</I>", "");

  // Quotation marks
  screenAnswer = screenAnswer.replace(/"/g, "");
  screenAnswer = screenAnswer.replace(/'/g, "");

  return (screenAnswer);
}

function evaluateAnswer(answer) {
  /*
   */

  let correctAnswer = clues[lastClueRequest]["raw_answer"];
  let playerAnswer = formatRawText(answer);

  let question = formatRawText(clues[lastClueRequest]["question"]);
  let categoryName = formatRawText(clues[lastClueRequest]["category"]["title"]);

  if (playerAnswer == correctAnswer) {
    return true;
  } else {
    if (question.includes(playerAnswer) || categoryName.includes(playerAnswer) || answer.length <= 2) {
      return false;
    } else {
      if (correctAnswer.includes(playerAnswer) || playerAnswer.includes(correctAnswer)) {
        return true;
      } else {
        return false;
      }
    }
  }
}

function updateScore(id, correct, multiplier) {
  /*
   */

  if (correct) {
    players[id].score += (200 * multiplier);
  } else {
    players[id].score -= (200 * multiplier);
  }
}

function reset() {
  /*
   */

  playersAnswered = [];
}