"use strict";

// Socket logic

// Setup express server
let express = require("express");
let app = express();
let path = require("path");
let server = require("http").createServer(app);
let io = require("socket.io")(server);

// Turn on server port
let ip = require("ip");
server.listen(3000, ip.address());

// Direct static file route to public folder
app.use(express.static(path.join(__dirname, "public")));

let players = {};
let boardController;
let lastClueRequest;
let playersAnswered = [];
let buzzersReady = false;
let answerReady = false;
let buzzWinnerId;
let doubleJeoparty = false;
let setupDoubleJeoparty = false;
let finalJeoparty = false;
let setupFinalJeoparty = false;

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

io.on("connection", function(socket) {
  /*
  Input:
  socket: Socket.io object
   */

  socket.join("session");

  socket.emit("connect_device");

  socket.on("set_host_socket", function() {
    getCategories();
    if (!setDailyDoubles) {
      setDailyDoubles = true;
      setDailyDoubleIds();
    }
  });

  socket.on("join_game", function(nickname, signature) {
    /*
    Input:
    nickname: string
    signature: image
     */

    let player = new Object();
    player.id = socket.id;
    player.playerNumber = Object.keys(players).length + 1;
    player.nickname = nickname;
    player.signature = signature;
    player.score = 0;
    player.wager = 0;

    players[socket.id] = player;

    if (Object.keys(players).length == 1) {
      boardController = socket.id;
    }

    io.in("session").emit("update_players_connected", Object.keys(players).length);

    io.in("session").emit("join_success", categoryNames, boardController);
    io.in("session").emit("players", players);
  });

  socket.on("start_game", function() {
    io.in("session").emit("load_game", categoryNames, categoryDates, boardController, players[boardController].nickname);
  });

  socket.on("request_clue", function(clueRequest) {
    /*
    Input:
    clueRequest: string ("category-x-price-y")
     */

    if ((!doubleJeoparty && clueRequest == dailyDoubleIds[0]) || (doubleJeoparty && (clueRequest == dailyDoubleIds[1] || clueRequest == dailyDoubleIds[2]))) {
      io.in("session").emit("daily_double_request", clueRequest, clues[clueRequest]["screen_question"], boardController, players[boardController].nickname);
    } else {
      io.in("session").emit("display_clue", clueRequest, clues[clueRequest]["screen_question"]);
    }

    usedClueIds.push(clueRequest);
    // Splits ("category-x-price-y"), so that usedClueArray["category-x"].push("price-y")
    usedClueArray[clueRequest.slice(0, 10)].push(clueRequest.slice(11));

    lastClueRequest = clueRequest;
  });

  socket.on("daily_double", function() {
    io.in("session").emit("request_daily_double_wager", clues[lastClueRequest]["category"]["title"], players[boardController], getMaxWager(players[boardController].score));
  });

  socket.on("daily_double_wager", function(wager) {
    /*
    Input:
    wager: number
     */

    players[boardController].wager = wager;
    io.in("session").emit("display_daily_double_clue", clues[lastClueRequest]["screen_question"]);
  });

  socket.on("answer_daily_double", function() {
    io.in("session").emit("answer_daily_double", players[boardController]);
  });

  socket.on("activate_buzzers", function() {
    io.in("session").emit("buzzers_ready", playersAnswered);
    buzzersReady = true;

    // Gets called if none of the players buzz in
    buzzerTimeout = setTimeout(function() {
      buzzersReady = false;
      io.in("session").emit("display_correct_answer", clues[lastClueRequest]["screen_answer"], true);
      setTimeout(function() {
        io.in("session").emit("reveal_scores");
        reset();

        setTimeout(function() {
          if (doubleJeoparty && !setupDoubleJeoparty) {
            setupDoubleJeoparty = true;
            io.in("session").emit("setup_double_jeoparty", categoryNames, categoryDates);
          } else if (finalJeoparty && !setupFinalJeoparty) {
            setupFinalJeoparty = true;
            io.in("session").emit("setup_final_jeoparty", finalJeopartyClue);
          }
          io.in("session").emit("reveal_board", usedClueArray, boardController, players[boardController].nickname);
        }, 5000);
      }, 5000);
    }, 5000);
  });

  socket.on("buzz", function() {
    if (buzzersReady) {
      clearTimeout(buzzerTimeout);

      buzzWinnerId = socket.id;
      buzzersReady = false;
      answerReady = true;

      io.in("session").emit("answer", players[buzzWinnerId]);
    }
  });

  socket.on("livefeed", function(livefeed) {
    /*
    Input:
    livefeed: string
     */

    io.in("session").emit("livefeed", livefeed);
  });

  socket.on("wager_livefeed", function(wagerLivefeed) {
    /*
    Input:
    wagerLivefeed: string number (i.e. '5' or '250')
     */

    io.in("session").emit("wager_livefeed", wagerLivefeed);
  });

  socket.on("submit_answer", function(answer) {
    /*
    Input:
    answer: string
     */

    if (answerReady) {
      answerReady = false;
      playersAnswered.push(socket.id);

      let correct = evaluateAnswer(answer);

      updateScore(socket.id, correct, lastClueRequest[lastClueRequest.length - 1], false);

      io.in("session").emit("answer_submitted", answer, correct);
      io.in("session").emit("players", players);

      setTimeout(function() {
        if (correct) {
          boardController = socket.id;
          io.in("session").emit("reveal_scores");
          reset();

          setTimeout(function() {
            if (doubleJeoparty && !setupDoubleJeoparty) {
              setupDoubleJeoparty = true;
              io.in("session").emit("setup_double_jeoparty", categoryNames, categoryDates);
            } else if (finalJeoparty && !setupFinalJeoparty) {
              setupFinalJeoparty = true;
              io.in("session").emit("setup_final_jeoparty", finalJeopartyClue);
            }
            io.in("session").emit("reveal_board", usedClueArray, boardController, players[boardController].nickname);
          }, 5000);
        } else if (playersAnswered.length == Object.keys(players).length) {
          // This branch runs if all of the players in the game
          // have attempted to answer
          io.in("session").emit("display_correct_answer", clues[lastClueRequest]["screen_answer"], false);
          setTimeout(function() {
            io.in("session").emit("reveal_scores");
            reset();

            setTimeout(function() {
              if (doubleJeoparty && !setupDoubleJeoparty) {
                setupDoubleJeoparty = true;
                io.in("session").emit("setup_double_jeoparty", categoryNames, categoryDates);
              } else if (finalJeoparty && !setupFinalJeoparty) {
                setupFinalJeoparty = true;
                io.in("session").emit("setup_final_jeoparty", finalJeopartyClue);
              }
              io.in("session").emit("reveal_board", usedClueArray, boardController, players[boardController].nickname);
            }, 5000);
          }, 5000);
        } else {
          // This branch runs if there are still players in the game
          // who are able to answer
          io.in("session").emit("buzzers_ready", playersAnswered);
          buzzersReady = true;

          // Gets called if none of the players buzz in
          buzzerTimeout = setTimeout(function() {
            buzzersReady = false;
            io.in("session").emit("display_correct_answer", clues[lastClueRequest]["screen_answer"], true);
            setTimeout(function() {
              io.in("session").emit("reveal_scores");
              reset();

              setTimeout(function() {
                if (doubleJeoparty && !setupDoubleJeoparty) {
                  setupDoubleJeoparty = true;
                  io.in("session").emit("setup_double_jeoparty", categoryNames, categoryDates);
                } else if (finalJeoparty && !setupFinalJeoparty) {
                  setupFinalJeoparty = true;
                  io.in("session").emit("setup_final_jeoparty", finalJeopartyClue);
                }
                io.in("session").emit("reveal_board", usedClueArray, boardController, players[boardController].nickname);
              }, 5000);
            }, 5000);
          }, 5000);
        }
      }, 5000);
    }
  });

  socket.on("submit_daily_double_answer", function(answer) {
    /*
    Input:
    answer: string
     */

    let correct = evaluateAnswer(answer);

    updateScore(socket.id, correct, 1, true);

    io.in("session").emit("answer_submitted", answer, correct);
    io.in("session").emit("players", players);

    setTimeout(function() {
      if (correct) {
        io.in("session").emit("reveal_scores");
        reset();

        setTimeout(function() {
          if (doubleJeoparty && !setupDoubleJeoparty) {
            setupDoubleJeoparty = true;
            io.in("session").emit("setup_double_jeoparty", categoryNames, categoryDates);
          } else if (finalJeoparty && !setupFinalJeoparty) {
            setupFinalJeoparty = true;
            io.in("session").emit("setup_final_jeoparty", finalJeopartyClue);
          }
          io.in("session").emit("reveal_board", usedClueArray, boardController, players[boardController].nickname);
        }, 5000);
      } else {
        io.in("session").emit("display_correct_answer", clues[lastClueRequest]["screen_answer"], false);
        setTimeout(function() {
          io.in("session").emit("reveal_scores");
          reset();

          setTimeout(function() {
            if (doubleJeoparty && !setupDoubleJeoparty) {
              setupDoubleJeoparty = true;
              io.in("session").emit("setup_double_jeoparty", categoryNames, categoryDates);
            } else if (finalJeoparty && !setupFinalJeoparty) {
              setupFinalJeoparty = true;
              io.in("session").emit("setup_final_jeoparty", finalJeopartyClue);
            }
            io.in("session").emit("reveal_board", usedClueArray, boardController, players[boardController].nickname);
          }, 5000);
        }, 5000);
      }
    }, 5000);
  });

  socket.on("disconnecting", function() {
    socket.leave("session");
    delete players[socket.id];
    io.in("session").emit("players", players);
    io.in("session").emit("update_players_connected", Object.keys(players).length);
  });
});

// Game logic

let js = require("jservice-node");

let usedCategoryIds = [];
let categoryNames = [];
let categoryDates = [];
let clues = {};
let setDailyDoubles = false;
let dailyDoubleIds = [];
let finalJeopartyClue = undefined;

function getCategories() {
  /*
  Result:
  Grabs random categories from jservice.io database
   */

  // Using a while loop that runs until 6 categories are approved
  // froze the browser so I'm using this cheap fix instead
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
  Input:
  category: JSON object

  Output:
  Returns true if all category questions meet criteria, else returns false
   */

  for (let i = 0; i < 5; i++) {
    let rawQuestion = formatRawText(category[i]["question"]);
    let rawCategory = formatRawText(category[i]["category"]["title"]);

    if (category[i]["invalid_count"] != null || rawQuestion.length == 0 || rawQuestion.includes("seenhere") || rawQuestion.includes("video") || rawCategory.includes("logo") || rawCategory.includes("video")) {
      return false;
    }
  }
  return true;
}

function loadCategory(category) {
  /*
  Input:
  category: JSON object

  Result:
  Adds category and its relevant data to a few global variables
  for use throughout the game
   */

  if (categoryNames.length < 6) {
    categoryNames.push(category[0]["category"]["title"]);
    categoryDates.push(category[0]["airdate"].slice(0, 4));

    for (let i = 1; i < 6; i++) {
      let id = "category-" + categoryNames.length + "-price-" + i;

      clues[id] = category[i - 1];
      clues[id]["screen_question"] = clues[id]["question"].toUpperCase();
      clues[id]["raw_answer"] = formatRawText(clues[id]["answer"]);
      clues[id]["screen_answer"] = formatScreenAnswer(clues[id]["answer"]);
    }
  } else if (finalJeopartyClue == undefined) {
    finalJeopartyClue = category[4];
  }
}

function setDailyDoubleIds() {
  /*
  Result:
  Selects 3 random clue ids to be daily double clues
   */

  let categoryNums = [1, 2, 3, 4, 5, 6];

  for (let i = 0; i < 3; i++) {
    // Changing categoryNums with each iteration stops the same
    // category number from having more than 1 daily double
    let index = Math.floor(Math.random() * categoryNums.length);
    let categoryNum = categoryNums[index];
    categoryNums.splice(index, 1);

    let priceNum;
    let rng = Math.random();

    // Simple bell curve structure for "weighted" randomization
    if (rng < .15) {
      priceNum = 3;
    } else if (rng > .85) {
      priceNum = 4;
    } else {
      priceNum = 5;
    }

    dailyDoubleIds.push("category-" + categoryNum + "-price-" + priceNum);
  }
  console.log(dailyDoubleIds);
}

function formatRawText(original) {
  /*
  Input:
  original: string

  Output:
  Removes formatting and punctuation from original, then returns it
   */

  let rawAnswer = original.toLowerCase();

  // Additional space so that replacing 'a ' always works
  // when 'a' is the last letter of original
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
  Input:
  original: string

  Output:
  Removes formatting and certain punctuations from original, then returns it
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

function getMaxWager(score) {
  /*
  Input:
  score: number

  Output:
  Returns the highest value the player can wager
   */

  let maxWager;

  if (doubleJeoparty) {
    if (score > 2000) {
      maxWager = score;
    } else {
      maxWager = 2000;
    }
  } else {
    if (score > 1000) {
      maxWager = score;
    } else {
      maxWager = 1000;
    }
  }

  return maxWager;
}

function evaluateAnswer(answer) {
  /*
  Input:
  answer: string

  Output:
  Returns true if the answer is correct (or is relatively close to correct),
  else returns false
   */

  let correctAnswer = clues[lastClueRequest]["raw_answer"];
  let playerAnswer = formatRawText(answer);

  let question = formatRawText(clues[lastClueRequest]["question"]);
  let categoryName = formatRawText(clues[lastClueRequest]["category"]["title"]);

  if (playerAnswer == correctAnswer) {
    return true;
  } else {
    // This check prevents players from trying to take advantage of a question like
    // "This man named Jack was a blah blah blah" by only answering with "Jack",
    // if they do this, they need to have the answer completely correct
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

function updateScore(id, correct, multiplier, dailyDouble) {
  /*
  Input:
  id: string (Socket id)
  correct: boolean
  multiplier: number
  dailyDouble: boolean

  Result:
  Changes the score variable of the given player object
   */

  let base;

  if (doubleJeoparty) {
    base = 400;
  } else if (dailyDouble) {
    base = players[id].wager;
  } else {
    base = 200;
  }

  if (correct) {
    players[id].score += (base * multiplier);
  } else {
    players[id].score -= (base * multiplier);
  }
}

function reset() {
  /*
  Result:
  Resets variables between each round
   */

  playersAnswered = [];

  // Resets board variables when Single Jeoparty board is empty
  if (usedClueIds.length == 1 && !doubleJeoparty) {
    doubleJeoparty = true;

    usedClueIds = [];

    usedClueArray = {
      "category-1": [],
      "category-2": [],
      "category-3": [],
      "category-4": [],
      "category-5": [],
      "category-6": [],
    };

    categoryNames = [];
    categoryDates = [];
    clues = {};

    getCategories();
  } else if (usedClueIds.length == 1 && doubleJeoparty) {
    finalJeoparty = true;
  }
}