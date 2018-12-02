"use strict";

// Setup basic express server
let express = require("express");
let app = express();
let path = require("path");
let server = require("http").createServer(app);
let io = require("socket.io")(server);

// Turn on server port
server.listen(3000, "18.40.34.91");

// Direct static file route to public folder
app.use(express.static(path.join(__dirname, "public")));

let hostSocket = undefined;
let players = {};

io.on("connection", function(socket) {
  socket.emit("connect_device");

  socket.on("set_host_socket", function() {
    hostSocket = socket;
  });

  socket.on("join_game", function() {
    let player = new Object();
    player.playerNumber = Object.keys(players).length + 1;
    player.nickname = "default";
    player.score = 0;

    players[socket.id] = player;

    socket.emit("join_success");

    if (Object.keys(players).length == 1) {
      socket.emit("load_game");
    }
  });

  socket.on("disconnecting", function() {
    delete players[socket.id];
  });
});