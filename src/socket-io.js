const { logger } = require("./utils/logger");
const passport = require("passport");
const ProductController = require("./controllers/ProductController");
const ChatController = require("./controllers/ChatController");
function setSocketData(socket) {
  const req = socket.request;
  socket.data.user = req.user;
  socket.data.logger = logger;
}
module.exports = (httpServer, sessionMiddleware) => {
  const io = require("socket.io")(httpServer); // Use received httpServer
  io.engine.use((req, res, next) => {
    const isHandshake = req._query.sid === undefined;
    if (!isHandshake) return next();
    sessionMiddleware(req, res, next);
  });
  io.engine.use((req, res, next) => {
    const isHandshake = req._query.sid === undefined;
    if (!isHandshake) return next();
    passport.session()(req, res, next);
  });
  io.on("connection", async (socket) => {
    logger.debug(`${new Date().toUTCString()} | SOCKET | User connected`);
    setSocketData(socket);
    socket.emit("user", socket.data.user);
    socket.on("getUser", () => {
      socket.emit("user", socket.data.user);
    });
    ChatController.socketHandler(io, socket); // real time chat
    ProductController.socketHandler(io, socket); // real time products
    socket.on("disconnect", () => {
      logger.debug(`${new Date().toUTCString()} | SOCKET | User disconnected`);
    });
  });

  return io;
};
