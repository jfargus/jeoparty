"use strict";

let socket = io();

let isController = false;

socket.on("connect_device", function() {
  // Checks to see if this is a mobile device
  if (/Mobi/.test(navigator.userAgent)) {
    isController = true;
  }
});