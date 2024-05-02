const { debugLog } = require("./utils/utils");
const ProductController = require("./controllers/ProductController");
const ChatController = require("./controllers/ChatController");

function auth(socket) {
  if (!socket.request.session.loggedIn) {
    socket.emit("error", "Not logged in");
    return socket.disconnect();
  }
  return socket.request.session.user.email;
}
module.exports = (httpServer, sessionMiddleware) => {
  const io = require("socket.io")(httpServer); // Use received httpServer
  io.engine.use(sessionMiddleware);
  io.on("connection", async (socket) => {
    const username = auth(socket);
    debugLog("User connected");
    socket.emit("alert", `You logged in as ${username}`);

    // real time chat
    ChatController.initialize(io, socket, username);
    // real time products
    ProductController.initialize(io, socket, username);
    socket.on("disconnect", () => {
      debugLog("User disconnected :(");
    });
  });

  return io;
};
