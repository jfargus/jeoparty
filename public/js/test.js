let sessions = {};
let sessionId;

while (true) {
  sessionId = Math.random().toString(36).substr(2, 5).toUpperCase();

  if (!sessions[sessionId]) {
    break;
  }
}

console.log(sessions);