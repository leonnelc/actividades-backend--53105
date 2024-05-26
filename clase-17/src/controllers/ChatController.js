const ChatService = require("../services/ChatService");
const { debugLog } = require("../utils/utils");
function socketHandler(io, socket) {
  // This should all be done with socket.io namespaces but i couldn't get it working
  function isInRoom() {
    return socket.rooms.has("chat");
  }
  function getUser() {
    return socket.data.user;
  }
  socket.on("chat:join", () => {
    if (!socket?.data?.loggedIn) {
      return debugLog("Socket not logged in");
    }
    user = socket.data.user;
    username = socket.data.user.email;
    socket.join("chat");
    socket.emit("chat:success");
  });
  socket.on("chat:message", async (message) => {
    try {
      if (!isInRoom()) throw new Error("User not in room");
      const user = getUser();
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
      debugLog(error);
      socket.emit("error", error.message);
    }
  });
  socket.on("chat:deleteMessage", async (id) => {
    if (!isInRoom()) return;
    try {
      if (
        !(await ChatService.userOwnsMessage(getUser().email, id)) &&
        getUser().role !== "admin"
      ) {
        throw new Error(`Not authorized to delete message`);
      }
      await ChatService.deleteMessage(id);
      io.to("chat").emit("chat:deleteMessage", id);
    } catch (error) {
      debugLog(error);
      socket.emit("error", error.message);
    }
  });
}

module.exports = { socketHandler };
