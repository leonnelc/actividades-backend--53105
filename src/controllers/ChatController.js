const ChatService = require("../services/ChatService");
const { logger } = require("../utils/logger.js");
function socketHandler(io, socket) {
  // This should all be done with socket.io namespaces but i couldn't get it working
  function isInRoom() {
    return socket.rooms.has("chat");
  }
  socket.on("chat:join", () => {
    if (!socket?.data?.user) {
      return logger.warnint(
        `${new Date().toUTCString()} | Socket not logged in`,
      );
    }
    socket.join("chat");
    socket.emit("chat:success");
  });
  socket.on("chat:message", async (message) => {
    try {
      if (!isInRoom()) throw new Error("User not in room");
      logger.debug(JSON.stringify(socket.data));
      const user = socket.data.user;
      if (user.role === "admin") {
        throw new Error("Admin can't send messages");
      }
      const addedMsg = await ChatService.addMessage(user, message);
      io.to("chat").emit("chat:message", {
        user: addedMsg.user,
        message: addedMsg.message,
        id: addedMsg._id,
      });
    } catch (error) {
      logger.warning(
        `${new Date().toUTCString()} | ${error.message} | ${error.stack.split("\n")[1].trim()}`,
      );
      socket.emit("error", error.message);
    }
  });
  socket.on("chat:deleteMessage", async (id) => {
    if (!isInRoom()) return;
    try {
      if (
        !(await ChatService.userOwnsMessage(socket.data.user.email, id)) &&
        socket.data.user.role !== "admin"
      ) {
        throw new Error(`Not authorized to delete message`);
      }
      await ChatService.deleteMessage(id);
      io.to("chat").emit("chat:deleteMessage", id);
    } catch (error) {
      logger.warning(
        `${new Date().toUTCString()} | ${error.message} | ${
          error.stack.split("\n")[1]
        }`,
      );
      socket.emit("error", error.message);
    }
  });
  socket.on("chat:updateMessage", async ({ id, message }) => {
    if (!isInRoom()) return;
    try {
      await ChatService.updateMessage(id, message, socket.data.user);
      io.to("chat").emit("chat:updateMessage", { id, message });
    } catch (error) {
      logger.warning(
        `${new Date().toUTCString()} | ${error.message} | ${error.stack}`,
      );
      socket.emit("error", error.message);
    }
  });
}

module.exports = { socketHandler };
