"use strict";

// Node requirements
const js = require("jservice-node");
const removeAccents = require("remove-accents");
const numberToWords = require("number-to-words");
const wordsToNumbers = require("words-to-numbers");
const ip = require("ip");

// Setup express server
const express = require("express");
const app = express();
const path = require("path");
const server = require("http").createServer(app);
const io = require("socket.io")(server);

const PORT = process.env.PORT || 5000;

server.listen(PORT);

// Direct static file route to client folder
app.use(express.static(path.join(__dirname, "client")));

// This is bad coding practice but is here so that the server can't crash
process.on("uncaughtException", (err) => {
  console.log(err);
});

// Each game that is occuring on the server simultaneously is given a
// session object with which to operate from. Throughout this script,
// game variables are referenced like this: sessions[socket.sessionId]
// so that multiple games can occur at once and the server can access the
// correct variables for each independent game

function session() {
  this.audioAllowed = false;
  this.gameActive = false;
  this.disconnectedPlayers = {};
  this.players = {};
  this.finalJeopartyPlayers = {};
  this.boardController;
  this.lastClueRequest;
  this.playersAnswered = [];
  this.buzzersReady = false;
  this.answerReady = false;
  this.buzzWinnerId;
  this.doubleJeoparty = false;
  this.setupDoubleJeoparty = false;
  this.finalJeoparty = false;
  this.setupFinalJeoparty = false;

  this.remainingClueIds = [
    "category-1-price-1", "category-1-price-2", "category-1-price-3", "category-1-price-4", "category-1-price-5",
    "category-2-price-1", "category-2-price-2", "category-2-price-3", "category-2-price-4", "category-2-price-5",
    "category-3-price-1", "category-3-price-2", "category-3-price-3", "category-3-price-4", "category-3-price-5",
    "category-4-price-1", "category-4-price-2", "category-4-price-3", "category-4-price-4", "category-4-price-5",
    "category-5-price-1", "category-5-price-2", "category-5-price-3", "category-5-price-4", "category-5-price-5",
    "category-6-price-1", "category-6-price-2", "category-6-price-3", "category-6-price-4", "category-6-price-5",
  ];
  this.usedClueIds = [];
  this.usedClueArray = {
    "category-1": [],
    "category-2": [],
    "category-3": [],
    "category-4": [],
    "category-5": [],
    "category-6": [],
  };

  // Gamestates
  this.requesting = false;
  this.answering = false;

  // Game data
  this.usedCategoryIds = [];
  this.categoryNames = [];
  this.categoryDates = [];
  this.clues = {};
  this.setDailyDoubles = false;
  this.dailyDoubleIds = [];
  this.finalJeopartyClue = undefined;
}

let sessions = {};

io.on("connection", function(socket) {
  /*
  Input:
  socket: Socket.io object
   */

  socket.emit("connect_device");

  socket.on("set_host_socket", function() {
    let sessionId;
    while (true) {
      // Returns a 5 character string composed of both letters and numbers
      // to serve as the session's ID
      sessionId = Math.random().toString(36).substr(2, 5).toUpperCase();
      if (!sessions[sessionId]) {
        break;
      }
    }
    sessions[sessionId] = new session();
    sessions[sessionId].sessionId = sessionId;
    socket.sessionId = sessionId;

    socket.host = true;

    console.log("IP Address: " + ip.address());
    console.log("Session ID: " + sessionId);

    socket.join(sessionId);

    socket.emit("update_session_id_text", sessionId);

    getCategories(socket);
    if (!sessions[sessionId].setDailyDoubles) {
      sessions[sessionId].setDailyDoubles = true;
      setDailyDoubleIds(socket);
    }
  });

  socket.on("audio_allowed", function() {
    if (sessions[socket.sessionId]) {
      sessions[socket.sessionId].audioAllowed = true;
    }
  });

  socket.on("join_session", function(newSessionId) {
    /*
    Input:
    newSessionId: string
     */

    let sessionId = newSessionId.replace(/ /g, "");

    if (sessions[sessionId]) {
      socket.sessionId = sessionId;
      socket.host = false;

      socket.join(sessionId);

      socket.emit("join_session_success", Object.keys(sessions[socket.sessionId].disconnectedPlayers).includes(socket.conn.remoteAddress), sessionId);
    } else {
      socket.emit("join_session_failure");
    }
  });

  socket.on("join_game", function(nickname, signature) {
    /*
    Input:
    nickname: string
    signature: image
     */

    if (sessions[socket.sessionId]) {
      if (!sessions[socket.sessionId].doubleJeoparty) {
        let player = new Object();
        player.id = socket.id;
        player.ip = socket.conn.remoteAddress;
        player.playerNumber = Object.keys(sessions[socket.sessionId].players).length + 1;
        player.nickname = nickname;
        player.signature = signature;
        player.score = 0;
        player.wager = 0;
        player.maxWager = 0;

        // Final Jeoparty variables
        player.answer = "";
        player.correct = false;

        sessions[socket.sessionId].players[socket.id] = player;

        if (Object.keys(sessions[socket.sessionId].players).length == 1) {
          sessions[socket.sessionId].boardController = socket.id;
        }

        io.in(socket.sessionId).emit("update_players_connected", Object.keys(sessions[socket.sessionId].players).length);
        io.in(socket.sessionId).emit("players", sessions[socket.sessionId].players);
      }

      socket.emit("join_success", sessions[socket.sessionId].categoryNames, sessions[socket.sessionId].boardController, sessions[socket.sessionId].gameActive, sessions[socket.sessionId].doubleJeoparty, false);
    }
  });

  socket.on("rejoin_game", function() {
    if (sessions[socket.sessionId]) {
      // This can only get called if this player object was inside of the
      // disconnectedPlayers object so this won't be a null reference
      let player = JSON.parse(JSON.stringify(sessions[socket.sessionId].disconnectedPlayers[socket.conn.remoteAddress]));
      sessions[socket.sessionId].players[socket.id] = player;
      sessions[socket.sessionId].players[socket.id].id = socket.id;
      delete sessions[socket.sessionId].disconnectedPlayers[socket.conn.remoteAddress];

      socket.emit("join_success", sessions[socket.sessionId].categoryNames, sessions[socket.sessionId].boardController, sessions[socket.sessionId].gameActive, sessions[socket.sessionId].doubleJeoparty, true);
      io.in(socket.sessionId).emit("players", sessions[socket.sessionId].players);
    }
  });

  socket.on("start_game", function() {
    if (sessions[socket.sessionId]) {
      if (sessions[socket.sessionId].audioAllowed) {
        sessions[socket.sessionId].gameActive = true;
        sessions[socket.sessionId].requesting = true;
        io.in(socket.sessionId).emit("load_game", sessions[socket.sessionId].categoryNames, sessions[socket.sessionId].categoryDates, sessions[socket.sessionId].boardController, sessions[socket.sessionId].players[sessions[socket.sessionId].boardController].nickname);
      } else {
        // The game relies heavily on the timing of the text to speech reading the
        // question aloud so the game won't start unless the players have
        // allowed audio to play
        socket.emit("start_game_failure");
      }
    }
  });

  socket.on("request_clue", function(clueRequest) {
    /*
    Input:
    clueRequest: string ("category-x-price-y")
     */

    if (sessions[socket.sessionId]) {
      if (sessions[socket.sessionId].remainingClueIds.includes(clueRequest)) {
        sessions[socket.sessionId].requesting = false;

        if ((!sessions[socket.sessionId].doubleJeoparty && clueRequest == sessions[socket.sessionId].dailyDoubleIds[0]) || (sessions[socket.sessionId].doubleJeoparty && (clueRequest == sessions[socket.sessionId].dailyDoubleIds[1] || clueRequest == sessions[socket.sessionId].dailyDoubleIds[2]))) {
          io.in(socket.sessionId).emit("daily_double_request", clueRequest, sessions[socket.sessionId].clues[clueRequest]["screen_question"], sessions[socket.sessionId].boardController, sessions[socket.sessionId].players[sessions[socket.sessionId].boardController].nickname);
        } else {
          io.in(socket.sessionId).emit("display_clue", clueRequest, sessions[socket.sessionId].clues[clueRequest]["screen_question"]);
        }

        sessions[socket.sessionId].remainingClueIds.splice(sessions[socket.sessionId].remainingClueIds.indexOf(clueRequest), 1);
        sessions[socket.sessionId].usedClueIds.push(clueRequest);
        // Splits ("category-x-price-y"), so that sessions[socket.sessionId].usedClueArray["category-x"].push("price-y")
        sessions[socket.sessionId].usedClueArray[clueRequest.slice(0, 10)].push(clueRequest.slice(11));

        sessions[socket.sessionId].lastClueRequest = clueRequest;
      }
    }
  });

  socket.on("daily_double", function() {
    if (sessions[socket.sessionId]) {
      sessions[socket.sessionId].answering = true;
      io.in(socket.sessionId).emit("update_answering", sessions[socket.sessionId].answering);

      io.in(socket.sessionId).emit("request_daily_double_wager", sessions[socket.sessionId].clues[sessions[socket.sessionId].lastClueRequest]["category"]["title"], sessions[socket.sessionId].players[sessions[socket.sessionId].boardController], getMaxWager(sessions[socket.sessionId].players[sessions[socket.sessionId].boardController].score, socket));
    }
  });

  socket.on("daily_double_wager", function(wager) {
    /*
    Input:
    wager: number
     */

    if (sessions[socket.sessionId]) {
      sessions[socket.sessionId].players[sessions[socket.sessionId].boardController].wager = wager;
      io.in(socket.sessionId).emit("display_daily_double_clue", sessions[socket.sessionId].clues[sessions[socket.sessionId].lastClueRequest]["screen_question"]);
    }
  });

  socket.on("answer_daily_double", function() {
    if (sessions[socket.sessionId]) {
      io.in(socket.sessionId).emit("answer_daily_double", sessions[socket.sessionId].players[sessions[socket.sessionId].boardController]);
    }
  });

  socket.on("activate_buzzers", function() {
    if (sessions[socket.sessionId]) {
      io.in(socket.sessionId).emit("buzzers_ready", sessions[socket.sessionId].playersAnswered);
      sessions[socket.sessionId].buzzersReady = true;
    }
  });

  socket.on("no_buzz", function() {
    // Gets called by a timeout in the host's javascript if nobody buzzes in
    if (sessions[socket.sessionId]) {
      sessions[socket.sessionId].buzzersReady = false;
      io.in(socket.sessionId).emit("display_correct_answer", sessions[socket.sessionId].clues[sessions[socket.sessionId].lastClueRequest]["screen_answer"], true);
      setTimeout(function() {
        if (socket.sessionId) {
          io.in(socket.sessionId).emit("reveal_scores");
          reset(socket);

          setTimeout(function() {
            if (socket.sessionId) {
              if (sessions[socket.sessionId].doubleJeoparty && !sessions[socket.sessionId].setupDoubleJeoparty) {
                sessions[socket.sessionId].setupDoubleJeoparty = true;
                io.in(socket.sessionId).emit("setup_double_jeoparty", sessions[socket.sessionId].categoryNames, sessions[socket.sessionId].categoryDates);
              } else if (sessions[socket.sessionId].finalJeoparty && !sessions[socket.sessionId].setupFinalJeoparty) {
                sessions[socket.sessionId].setupFinalJeoparty = true;
                io.in(socket.sessionId).emit("setup_final_jeoparty", sessions[socket.sessionId].finalJeopartyClue);
              }
              io.in(socket.sessionId).emit("reveal_board", sessions[socket.sessionId].usedClueArray, sessions[socket.sessionId].remainingClueIds, sessions[socket.sessionId].boardController, sessions[socket.sessionId].players[sessions[socket.sessionId].boardController].nickname);
              sessions[socket.sessionId].requesting = true;
            }
          }, 5000);
        }
      }, 5000);
    }
  });

  socket.on("buzz", function() {
    if (sessions[socket.sessionId]) {
      if (sessions[socket.sessionId].buzzersReady) {
        sessions[socket.sessionId].buzzWinnerId = socket.id;
        sessions[socket.sessionId].buzzersReady = false;
        sessions[socket.sessionId].answerReady = true;

        setTimeout(function() {
          io.in(socket.sessionId).emit("answer", sessions[socket.sessionId].players[sessions[socket.sessionId].buzzWinnerId]);

          sessions[socket.sessionId].answering = true;
          io.in(socket.sessionId).emit("update_answering", sessions[socket.sessionId].answering);
        }, 100);
      }
    }
  });

  socket.on("livefeed", function(livefeed) {
    /*
    Input:
    livefeed: string
     */

    if (sessions[socket.sessionId]) {
      io.in(socket.sessionId).emit("livefeed", livefeed);
    }
  });

  socket.on("wager_livefeed", function(wagerLivefeed) {
    /*
    Input:
    wagerLivefeed: string number (i.e. '5' or '250')
     */

    if (sessions[socket.sessionId]) {
      io.in(socket.sessionId).emit("wager_livefeed", wagerLivefeed);
    }
  });

  socket.on("submit_answer", function(answer) {
    /*
    Input:
    answer: string
     */

    if (sessions[socket.sessionId]) {
      sessions[socket.sessionId].answering = false;
      io.in(socket.sessionId).emit("update_answering", sessions[socket.sessionId].answering);

      if (sessions[socket.sessionId].answerReady) {
        sessions[socket.sessionId].answerReady = false;
        sessions[socket.sessionId].playersAnswered.push(socket.id);

        let correct = evaluateAnswer(answer, socket);

        updateScore(socket.id, correct, sessions[socket.sessionId].lastClueRequest[sessions[socket.sessionId].lastClueRequest.length - 1], false, socket);

        io.in(socket.sessionId).emit("answer_submitted", answer, correct);
        io.in(socket.sessionId).emit("players", sessions[socket.sessionId].players);

        setTimeout(function() {
          if (socket.sessionId) {
            if (correct) {
              // This branch runs if the answer is correct
              sessions[socket.sessionId].boardController = socket.id;
              io.in(socket.sessionId).emit("reveal_scores");
              reset(socket);

              setTimeout(function() {
                if (socket.sessionId) {
                  if (sessions[socket.sessionId].doubleJeoparty && !sessions[socket.sessionId].setupDoubleJeoparty) {
                    sessions[socket.sessionId].setupDoubleJeoparty = true;
                    io.in(socket.sessionId).emit("setup_double_jeoparty", sessions[socket.sessionId].categoryNames, sessions[socket.sessionId].categoryDates);
                  } else if (sessions[socket.sessionId].finalJeoparty && !sessions[socket.sessionId].setupFinalJeoparty) {
                    sessions[socket.sessionId].setupFinalJeoparty = true;
                    io.in(socket.sessionId).emit("setup_final_jeoparty", sessions[socket.sessionId].finalJeopartyClue);
                  }
                  io.in(socket.sessionId).emit("reveal_board", sessions[socket.sessionId].usedClueArray, sessions[socket.sessionId].remainingClueIds, sessions[socket.sessionId].boardController, sessions[socket.sessionId].players[sessions[socket.sessionId].boardController].nickname);
                  sessions[socket.sessionId].requesting = true;
                }
              }, 5000);
            } else if (sessions[socket.sessionId].playersAnswered.length == Object.keys(sessions[socket.sessionId].players).length) {
              // This branch runs if all of the players in the game
              // have already attempted to answer
              io.in(socket.sessionId).emit("display_correct_answer", sessions[socket.sessionId].clues[sessions[socket.sessionId].lastClueRequest]["screen_answer"], false);
              setTimeout(function() {
                if (socket.sessionId) {
                  io.in(socket.sessionId).emit("reveal_scores");
                  reset(socket);

                  setTimeout(function() {
                    if (socket.sessionId) {
                      if (sessions[socket.sessionId].doubleJeoparty && !sessions[socket.sessionId].setupDoubleJeoparty) {
                        sessions[socket.sessionId].setupDoubleJeoparty = true;
                        io.in(socket.sessionId).emit("setup_double_jeoparty", sessions[socket.sessionId].categoryNames, sessions[socket.sessionId].categoryDates);
                      } else if (sessions[socket.sessionId].finalJeoparty && !sessions[socket.sessionId].setupFinalJeoparty) {
                        sessions[socket.sessionId].setupFinalJeoparty = true;
                        io.in(socket.sessionId).emit("setup_final_jeoparty", sessions[socket.sessionId].finalJeopartyClue);
                      }
                      io.in(socket.sessionId).emit("reveal_board", sessions[socket.sessionId].usedClueArray, sessions[socket.sessionId].remainingClueIds, sessions[socket.sessionId].boardController, sessions[socket.sessionId].players[sessions[socket.sessionId].boardController].nickname);
                      sessions[socket.sessionId].requesting = true;
                    }
                  }, 5000);
                }
              }, 5000);
            } else {
              // This branch runs if there are still players in the game
              // who are able to answer
              io.in(socket.sessionId).emit("buzzers_ready", sessions[socket.sessionId].playersAnswered);
              sessions[socket.sessionId].buzzersReady = true;
            }
          }
        }, 5000);
      }
    }
  });

  socket.on("submit_daily_double_answer", function(answer) {
    /*
    Input:
    answer: string
     */

    if (sessions[socket.sessionId]) {
      sessions[socket.sessionId].answering = false;
      io.in(socket.sessionId).emit("update_answering", sessions[socket.sessionId].answering);

      let correct = evaluateAnswer(answer, socket);

      updateScore(socket.id, correct, 1, true, socket);

      io.in(socket.sessionId).emit("answer_submitted", answer, correct);
      io.in(socket.sessionId).emit("players", sessions[socket.sessionId].players);

      setTimeout(function() {
        if (socket.sessionId) {
          if (correct) {
            io.in(socket.sessionId).emit("reveal_scores");
            reset(socket);

            setTimeout(function() {
              if (socket.sessionId) {
                if (sessions[socket.sessionId].doubleJeoparty && !sessions[socket.sessionId].setupDoubleJeoparty) {
                  sessions[socket.sessionId].setupDoubleJeoparty = true;
                  io.in(socket.sessionId).emit("setup_double_jeoparty", sessions[socket.sessionId].categoryNames, sessions[socket.sessionId].categoryDates);
                } else if (sessions[socket.sessionId].finalJeoparty && !sessions[socket.sessionId].setupFinalJeoparty) {
                  sessions[socket.sessionId].setupFinalJeoparty = true;
                  io.in(socket.sessionId).emit("setup_final_jeoparty", sessions[socket.sessionId].finalJeopartyClue);
                }
                io.in(socket.sessionId).emit("reveal_board", sessions[socket.sessionId].usedClueArray, sessions[socket.sessionId].remainingClueIds, sessions[socket.sessionId].boardController, sessions[socket.sessionId].players[sessions[socket.sessionId].boardController].nickname);
                sessions[socket.sessionId].requesting = true;
              }
            }, 5000);
          } else {
            io.in(socket.sessionId).emit("display_correct_answer", sessions[socket.sessionId].clues[sessions[socket.sessionId].lastClueRequest]["screen_answer"], false);
            setTimeout(function() {
              if (socket.sessionId) {
                io.in(socket.sessionId).emit("reveal_scores");
                reset(socket);

                setTimeout(function() {
                  if (socket.sessionId) {
                    if (sessions[socket.sessionId].doubleJeoparty && !sessions[socket.sessionId].setupDoubleJeoparty) {
                      sessions[socket.sessionId].setupDoubleJeoparty = true;
                      io.in(socket.sessionId).emit("setup_double_jeoparty", sessions[socket.sessionId].categoryNames, sessions[socket.sessionId].categoryDates);
                    } else if (sessions[socket.sessionId].finalJeoparty && !sessions[socket.sessionId].setupFinalJeoparty) {
                      sessions[socket.sessionId].setupFinalJeoparty = true;
                      io.in(socket.sessionId).emit("setup_final_jeoparty", sessions[socket.sessionId].finalJeopartyClue);
                    }
                    io.in(socket.sessionId).emit("reveal_board", sessions[socket.sessionId].usedClueArray, sessions[socket.sessionId].remainingClueIds, sessions[socket.sessionId].boardController, sessions[socket.sessionId].players[sessions[socket.sessionId].boardController].nickname);
                    sessions[socket.sessionId].requesting = true;
                  }
                }, 5000);
              }
            }, 5000);
          }
        }
      }, 5000);
    }
  });

  socket.on("displayed_final_jeoparty_category", function() {
    if (sessions[socket.sessionId]) {
      for (let id in sessions[socket.sessionId].players) {
        // Doesn't let any player who has less than or equal to 0 dollars
        // participate in final jeoparty
        if (sessions[socket.sessionId].players[id].score > 0) {
          sessions[socket.sessionId].players[id].maxWager = getMaxWager(sessions[socket.sessionId].players[id].score, socket);
          sessions[socket.sessionId].finalJeopartyPlayers[id] = sessions[socket.sessionId].players[id];
        }
      }

      io.in(socket.sessionId).emit("request_final_jeoparty_wager", sessions[socket.sessionId].finalJeopartyPlayers);

      setTimeout(function() {
        if (socket.sessionId) {
          io.in(socket.sessionId).emit("display_final_jeoparty_clue");
        }
      }, 15000);
    }
  });

  socket.on("final_jeoparty_wager", function(wager) {
    /*
    Input:
    wager: number
     */

    if (sessions[socket.sessionId]) {
      sessions[socket.sessionId].finalJeopartyPlayers[socket.id].wager = wager;
    }
  });

  socket.on("answer_final_jeoparty", function() {
    if (sessions[socket.sessionId]) {
      io.in(socket.sessionId).emit("answer_final_jeoparty");
      setTimeout(function() {
        if (socket.sessionId) {
          io.in(socket.sessionId).emit("display_final_jeoparty_answer", sessions[socket.sessionId].finalJeopartyPlayers);
          setTimeout(function() {
            if (socket.sessionId) {
              io.in(socket.sessionId).emit("reset_game");
              delete sessions[socket.sessionId];
            }
            // Resets the game in the amount of time it takes to display each players'
            // clue plus a minute
          }, 60000 + ((Object.keys(sessions[socket.sessionId].finalJeopartyPlayers).length) * 5000));
        }
      }, 30000);
    }
  });

  socket.on("submit_final_jeoparty_answer", function(answer) {
    /*
    Input:
    answer: string
     */

    if (sessions[socket.sessionId]) {
      sessions[socket.sessionId].finalJeopartyPlayers[socket.id].answer = answer;
      sessions[socket.sessionId].finalJeopartyPlayers[socket.id].correct = evaluateAnswer(answer, socket);
      if (evaluateAnswer(answer, socket)) {
        sessions[socket.sessionId].finalJeopartyPlayers[socket.id].score += sessions[socket.sessionId].finalJeopartyPlayers[socket.id].wager;
      } else {
        sessions[socket.sessionId].finalJeopartyPlayers[socket.id].score -= sessions[socket.sessionId].finalJeopartyPlayers[socket.id].wager;
      }
    }
  });

  socket.on("request_players", function() {
    if (sessions[socket.sessionId]) {
      io.in(socket.sessionId).emit("players", sessions[socket.sessionId].players);
    }
  });

  socket.on("disconnecting", function() {
    if (socket.sessionId) {
      if (sessions[socket.sessionId]) {
        if (Object.keys(sessions[socket.sessionId].players).length == 1) {
          io.in(socket.sessionId).emit("reset_game");
          delete sessions[socket.sessionId];
        } else {
          try {
            // This gives players an opportunity to rejoin the game if they
            // did not intend to disconnect from the game
            let player = JSON.parse(JSON.stringify(sessions[socket.sessionId].players[socket.id]));
            sessions[socket.sessionId].disconnectedPlayers[socket.conn.remoteAddress] = player;
          } catch (e) {
            // If player hasn't joined the game yet and wouldn't have a position
            // inside of the players object
          }

          if (socket.host) {
            delete sessions[socket.sessionId];
          }

          socket.leave(socket.sessionId);

          try {
            delete sessions[socket.sessionId].players[socket.id];
          } catch (e) {
            // If player hasn't joined the game yet and wouldn't have a position
            // inside of the players object
          }

          if (sessions[socket.sessionId].finalJeoparty) {
            try {
              delete sessions[socket.sessionId].finalJeopartyPlayers[socket.id];
            } catch (e) {
              // If player was not added to finalJeopartyPlayers because
              // they didn't have enough money
            }
          }

          io.in(socket.sessionId).emit("players", sessions[socket.sessionId].players);
          io.in(socket.sessionId).emit("update_players_connected", Object.keys(sessions[socket.sessionId].players).length);

          if (sessions[socket.sessionId].gameActive) {
            if (sessions[socket.sessionId].boardController == socket.id) {
              // If the disconnected player was the board controller, the role of
              // board controller is moved to another player
              sessions[socket.sessionId].boardController = Object.keys(sessions[socket.sessionId].players)[0];
              io.in(socket.sessionId).emit("change_board_controller", sessions[socket.sessionId].boardController, sessions[socket.sessionId].players[sessions[socket.sessionId].boardController].nickname);
            }

            if (sessions[socket.sessionId].answering && (sessions[socket.sessionId].boardController == socket.id || sessions[socket.sessionId].buzzWinnerId == socket.id)) {
              // If the disconnected player was in the middle of answering,
              // the host cuts to displaying the correct answer and the game moves on
              io.in(socket.sessionId).emit("display_correct_answer", sessions[socket.sessionId].clues[sessions[socket.sessionId].lastClueRequest]["screen_answer"], false);
              setTimeout(function() {
                if (socket.sessionId) {
                  io.in(socket.sessionId).emit("reveal_scores");
                  setTimeout(function() {
                    if (socket.sessionId) {
                      io.in(socket.sessionId).emit("reveal_board", sessions[socket.sessionId].usedClueArray, sessions[socket.sessionId].remainingClueIds, sessions[socket.sessionId].boardController, sessions[socket.sessionId].players[sessions[socket.sessionId].boardController].nickname);
                      sessions[socket.sessionId].requesting = true;
                    }
                  }, 5000);
                }
              }, 5000);
            }
          }
        }
      }
    }
  });
});

// Game logic

function getStartingIndex(cluesCount) {
  /*
  Input:
  cluesCount: number

  Result:
  Returns a multiple of 5 in the range of cluesCount (but not including cluesCount)

  5 -> 0
  15 -> 0, 5, 10
  25 -> 0, 5, 10, 15, 20
   */

  return (Math.round((Math.random() * (cluesCount - 5)) / 5) * 5);
}

function getCategories(socket) {
  /*
  Input:
  socket: string (socket ID)

  Result:
  Grabs random categories from jservice.io database
   */

  // Using a while loop that runs until 6 categories are approved
  // froze the browser so I'm using this cheap for loop fix instead
  for (let i = 0; i < 20; i++) {

    let categoryId = Math.floor(Math.random() * 18418) + 1;

    let options = {
      category: categoryId,
    };

    js.clues(options, function(error, response, json) {
      let startingIndex = getStartingIndex(json[0]["category"]["clues_count"]);
      if (!error && response.statusCode == 200 && !sessions[socket.sessionId].usedCategoryIds.includes(categoryId) && approveCategory(json, startingIndex)) {
        sessions[socket.sessionId].usedCategoryIds.push(categoryId);
        loadCategory(json, startingIndex, socket);
      }
    });
  }
}

function approveCategory(category, startingIndex) {
  /*
  Input:
  category: JSON object
  startingIndex: number

  Output:
  Returns true if all category questions meet criteria, else returns false
   */

  for (let i = startingIndex; i < (startingIndex + 5); i++) {
    let rawQuestion = formatRawText(category[i]["question"]);
    let rawCategory = formatRawText(category[i]["category"]["title"]);

    if (category[i]["invalid_count"] != null || rawQuestion.length == 0 ||
      rawQuestion.includes("seenhere") || rawQuestion.includes("heardhere") ||
      rawQuestion.includes("video") || rawCategory.includes("logo") ||
      rawCategory.includes("video") || rawQuestion.length > 300) {
      return false;
    }
  }
  return true;
}

function loadCategory(category, startingIndex, socket) {
  /*
  Input:
  category: JSON object
  startingIndex: number
  socket: string (socket ID)

  Result:
  Adds category and its relevant data to a few global variables
  for use throughout the game
   */

  let indices = [];

  for (let j = startingIndex; j < startingIndex + 5; j++) {
    indices.push(j);
  }

  if (sessions[socket.sessionId].categoryNames.length < 6) {
    sessions[socket.sessionId].categoryNames.push(category[indices[0]]["category"]["title"]);
    sessions[socket.sessionId].categoryDates.push(category[indices[0]]["airdate"].slice(0, 4));

    for (let i = 1; i < 6; i++) {
      let id = "category-" + sessions[socket.sessionId].categoryNames.length + "-price-" + i;

      sessions[socket.sessionId].clues[id] = category[indices[i - 1]];
      sessions[socket.sessionId].clues[id]["screen_question"] = sessions[socket.sessionId].clues[id]["question"].toUpperCase();
      sessions[socket.sessionId].clues[id]["raw_answer"] = formatRawText(sessions[socket.sessionId].clues[id]["answer"]);
      sessions[socket.sessionId].clues[id]["screen_answer"] = formatScreenAnswer(sessions[socket.sessionId].clues[id]["answer"]);
    }
  } else if (sessions[socket.sessionId].finalJeopartyClue == undefined) {
    sessions[socket.sessionId].finalJeopartyClue = category[indices[4]];
    sessions[socket.sessionId].finalJeopartyClue["screen_question"] = sessions[socket.sessionId].finalJeopartyClue["question"].toUpperCase();
    sessions[socket.sessionId].finalJeopartyClue["raw_answer"] = formatRawText(sessions[socket.sessionId].finalJeopartyClue["answer"]);
    sessions[socket.sessionId].finalJeopartyClue["screen_answer"] = formatScreenAnswer(sessions[socket.sessionId].finalJeopartyClue["answer"]);
  }
}

function setDailyDoubleIds(socket) {
  /*
  Input:
  socket: string (socket ID)

  Result:
  Selects 3 random clue ids to be daily double sessions[socket.sessionId].clues
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

    sessions[socket.sessionId].dailyDoubleIds.push("category-" + categoryNum + "-price-" + priceNum);
  }
}

function formatRawText(original) {
  /*
  Input:
  original: string

  Output:
  Removes formatting and punctuation from original, then returns it
   */

  let rawAnswer = original.toLowerCase();

  // Remove accents
  rawAnswer = removeAccents(rawAnswer);

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

function getMaxWager(score, socket) {
  /*
  Input:
  score: number
  socket: string (socket ID)

  Output:
  Returns the highest value the player can wager
   */

  let maxWager;

  if (sessions[socket.sessionId].doubleJeoparty) {
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

function evaluateAnswer(answer, socket) {
  /*
  Input:
  answer: string
  socket: string (socket ID)

  Output:
  Returns true if the answer is correct (or is relatively close to correct),
  else returns false
   */

  let correctAnswer;

  if (sessions[socket.sessionId].finalJeoparty) {
    correctAnswer = sessions[socket.sessionId].finalJeopartyClue["raw_answer"];
  } else {
    correctAnswer = sessions[socket.sessionId].clues[sessions[socket.sessionId].lastClueRequest]["raw_answer"];
  }
  let playerAnswer = formatRawText(answer);

  let question = formatRawText(sessions[socket.sessionId].clues[sessions[socket.sessionId].lastClueRequest]["question"]);
  let categoryName = formatRawText(sessions[socket.sessionId].clues[sessions[socket.sessionId].lastClueRequest]["category"]["title"]);

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
        if (isNaN(playerAnswer)) {
          if (wordsToNumbers.wordsToNumbers(correctAnswer).includes(playerAnswer) || wordsToNumbers.wordsToNumbers(playerAnswer).includes(correctAnswer)) {
            return true;
          } else {
            return false;
          }
        } else {
          if (numberToWords.toWords(playerAnswer) == correctAnswer) {
            return true;
          } else {
            return false;
          }
        }
      }
    }
  }
}

function updateScore(id, correct, multiplier, dailyDouble, socket) {
  /*
  Input:
  id: string (Socket id)
  correct: boolean
  multiplier: number
  dailyDouble: boolean
  socket: string (socket ID)

  Result:
  Changes the score variable of the given player object
   */

  let base;

  if (dailyDouble) {
    base = sessions[socket.sessionId].players[id].wager;
  } else if (sessions[socket.sessionId].doubleJeoparty) {
    base = 400;
  } else {
    base = 200;
  }

  if (correct) {
    sessions[socket.sessionId].players[id].score += (base * multiplier);
  } else {
    sessions[socket.sessionId].players[id].score -= (base * multiplier);
  }
}

function reset(socket) {
  /*
  Input:
  socket: string (socket ID)

  Result:
  Resets variables between each round
   */

  sessions[socket.sessionId].playersAnswered = [];

  // Resets board variables when Single Jeoparty board is empty
  if (sessions[socket.sessionId].usedClueIds.length == 30 && !sessions[socket.sessionId].doubleJeoparty) {
    sessions[socket.sessionId].doubleJeoparty = true;

    sessions[socket.sessionId].remainingClueIds = [
      "category-1-price-1", "category-1-price-2", "category-1-price-3", "category-1-price-4", "category-1-price-5",
      "category-2-price-1", "category-2-price-2", "category-2-price-3", "category-2-price-4", "category-2-price-5",
      "category-3-price-1", "category-3-price-2", "category-3-price-3", "category-3-price-4", "category-3-price-5",
      "category-4-price-1", "category-4-price-2", "category-4-price-3", "category-4-price-4", "category-4-price-5",
      "category-5-price-1", "category-5-price-2", "category-5-price-3", "category-5-price-4", "category-5-price-5",
      "category-6-price-1", "category-6-price-2", "category-6-price-3", "category-6-price-4", "category-6-price-5",
    ];
    sessions[socket.sessionId].usedClueIds = [];
    sessions[socket.sessionId].usedClueArray = {
      "category-1": [],
      "category-2": [],
      "category-3": [],
      "category-4": [],
      "category-5": [],
      "category-6": [],
    };

    sessions[socket.sessionId].categoryNames = [];
    sessions[socket.sessionId].categoryDates = [];
    sessions[socket.sessionId].clues = {};

    // Gives board control to the player in last place to begin
    // double jeoparty
    let clone = JSON.parse(JSON.stringify(sessions[socket.sessionId].players));
    let keys = Object.keys(clone);
    keys.sort(function(a, b) {
      return clone[a].score - clone[b].score;
    });
    sessions[socket.sessionId].boardController = keys[0];

    getCategories(socket);
  } else if (sessions[socket.sessionId].usedClueIds.length == 30 && sessions[socket.sessionId].doubleJeoparty) {
    sessions[socket.sessionId].finalJeoparty = true;
    sessions[socket.sessionId].doubleJeoparty = false;
  }
}