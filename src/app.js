const express = require("express");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const passport = require("passport");
const initializePassport = require("./config/passport.config");
const ErrorHandler = require("./middleware/ErrorHandler");
const NotFound = require("./middleware/NotFound");
const UpdateSockets = require("./middleware/UpdateSockets");
const { addLogger, logger, enableDebugLogging } = require("./utils/logger.js");
const {
  PORT,
  HOSTNAME,
  MONGO_URL,
  SESSION_SECRET,
  DEBUGGING,
} = require("./config/config");
if (DEBUGGING) {
  enableDebugLogging();
  logger.info(`${new Date().toUTCString()} | Debugging logs enabled`);
}
const app = express();

const productRouter = require("./routes/product.routes");
const cartRouter = require("./routes/cart.routes");
const testingRouter = require("./routes/testing.routes");
const viewsRouter = require("./routes/views.routes");
const authRouter = require("./routes/auth.routes");
const usersRouter = require("./routes/users.routes.js");
const exphbs = require("express-handlebars");
const sessionMiddleware = session({
  secret: SESSION_SECRET,
  resave: true,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: MONGO_URL,
    ttl: 86400,
  }),
});

// middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(sessionMiddleware);
initializePassport();
app.use(express.static("./src/public")); // Needs to be before passport to avoid deserialization when accessing static files
app.use(addLogger);
app.use(passport.initialize());
app.use(passport.session());

// express-handlebars & config
app.engine("handlebars", exphbs.engine());
app.set("view engine", "handlebars");
app.set("views", "./src/views");

// routers
app.use("/", testingRouter);
app.use("/api/products", productRouter);
app.use("/api/carts", cartRouter);
app.use("/api/sessions", authRouter);
app.use("/api/users", usersRouter);
app.use("/", viewsRouter);

// other middlewares
app.use(UpdateSockets(socketIO));
app.use(NotFound);
app.use(ErrorHandler);

const httpServer = app.listen(PORT, () => {
  logger.info(
    `${new Date().toUTCString()} | Server listening at ${HOSTNAME ? HOSTNAME : "localhost"}:${PORT}`,
  );
});

// socket.io logic
var socketIO = require("./socket-io")(httpServer, sessionMiddleware);

require("./database");
