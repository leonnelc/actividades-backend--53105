const { logger } = require("./utils/logger");
const { JWT_SECRET } = require("./config/config");
const ErrorHandler = require("./middleware/ErrorHandler");
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");
const ProductController = require("./controllers/ProductController");
const ChatController = require("./controllers/ChatController");
function setSocketData(socket) {
  const req = socket.request;
  socket.data.user = req.user;
  socket.data.logger = logger;
}
module.exports = (httpServer) => {
  const io = require("socket.io")(httpServer, { withCredentials: true }); // Use received httpServer
  io.engine.use(cookieParser());
  io.engine.use(async (req, res, next) => {
    const isHandshake = req._query.sid === undefined;
    try {
      if (isHandshake) {
        if (!req.cookies.jwt) return next();
        const decoded = jwt.verify(req.cookies.jwt, JWT_SECRET);
        const user = decoded.user;
        req.user = user;
      }
    } catch (error) {
      ErrorHandler(error, req, res, "socket");
    }
    next();
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
