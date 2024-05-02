const ChatService = require("../services/ChatService");
function initialize(io, socket, username) {
  socket.on("message", (message) => {
    if (username == null) {
      return socket.emit(
        "error",
        "You need to log in before sending messages!"
      );
    }
    message = ChatService.processMessage(message);
    if (!message) {
      return;
    }
    ChatService.addMessage(username, message);
    io.emit("message", { username: username, message: message });
  });
}

module.exports = { initialize };
