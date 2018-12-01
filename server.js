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

io.on("connection", function(socket) {
  socket.emit("connect_device");
});