const ChatService = require("../services/ChatService");
const ChatError = require("../services/errors/api/ChatError");
const ErrorHandler = require("../middleware/ErrorHandler");

function socketHandler(io, socket) {
  // TODO: use namespaces instead of a "chat:" prefix
  function isInRoom() {
    return socket.rooms.has("chat");
  }
  socket.on("chat:join", () => {
    try {
      if (!socket?.data?.user) throw new ChatError("Not logged in");
      socket.join("chat");
      socket.emit("chat:success");
    } catch (error) {
      ErrorHandler(error, socket.data, socket, "socket");
    }
  });
  socket.on("chat:message", async (message) => {
    try {
      if (!isInRoom()) return;
      const user = socket.data.user;
      if (user.role === "admin") {
        throw new ChatError("Admin can't send messages");
      }
      const addedMsg = await ChatService.addMessage(user, message);
      io.to("chat").emit("chat:message", {
        user: addedMsg.user,
        message: addedMsg.message,
        id: addedMsg._id,
      });
    } catch (error) {
      ErrorHandler(error, socket.data, socket, "socket");
    }
  });
  socket.on("chat:deleteMessage", async (id) => {
    if (!isInRoom()) return;
    try {
      if (
        socket.data.user.role != "admin" &&
        !(await ChatService.userOwnsMessage(socket.data.user.email, id))
      ) {
        throw new ChatError(`Not authorized to delete message`);
      }
      await ChatService.deleteMessage(id);
      io.to("chat").emit("chat:deleteMessage", id);
    } catch (error) {
      ErrorHandler(error, socket.data, socket, "socket");
    }
  });
  socket.on("chat:updateMessage", async ({ id, message }) => {
    if (!isInRoom()) return;
    try {
      await ChatService.updateMessage(id, message, socket.data.user);
      io.to("chat").emit("chat:updateMessage", { id, message });
    } catch (error) {
      ErrorHandler(error, socket.data, socket, "socket");
    }
  });
}

module.exports = { socketHandler };
