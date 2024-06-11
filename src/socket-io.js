const { logger } = require("./utils/logger");
const ProductController = require("./controllers/ProductController");
const ChatController = require("./controllers/ChatController");
function setSocketData(socket) {
  const { loggedIn, user } = socket.request.session;
  socket.data.loggedIn = loggedIn;
  socket.data.user = user;
}
module.exports = (httpServer, sessionMiddleware) => {
  const io = require("socket.io")(httpServer); // Use received httpServer
  io.engine.use(sessionMiddleware);
  io.on("connection", async (socket) => {
    logger.debug(`${new Date().toUTCString()} | User connected`);
    setSocketData(socket);
    socket.on("getUser", () => {
      socket.emit("user", socket.data.user);
    });
    ChatController.socketHandler(io, socket); // real time chat
    ProductController.socketHandler(io, socket); // real time products
    socket.on("disconnect", () => {
      logger.debug(`${new Date().toUTCString()} | User disconnected`);
    });
  });

  return io;
};
