const express = require("express");
const passport = require("passport");
const initializePassport = require("./config/passport.config");
const { addLogger, logger, enableDebugLogging } = require("./utils/logger.js");
const { PORT, HOSTNAME, DEBUGGING, DISABLE_CACHE } = require("./config/config");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./swagger");
const compression = require("compression");

if (DEBUGGING) {
  enableDebugLogging();
  logger.info(`${new Date().toUTCString()} | Debugging logs enabled`);
}
const app = express();
app.enable("trust proxy");
app.use(addLogger);
app.use(compression());

initializePassport();

const setHeaders = (res, _path, _stat) => {
  res.set("Cache-Control", "public, max-age=86400"); // Cache for one day
};
// middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/css", express.static("./src/public/css", { setHeaders }));
app.use("/js", express.static("./src/public/js", { setHeaders }));
app.use("/images", express.static("./src/public/images", { setHeaders }));
app.use(express.static("./src/public")); // Static files need to be before passport
app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, { customCssUrl: "/css/swaggerDark.css" }),
);
app.use(require("cookie-parser")());
app.use(passport.initialize());
app.use(require("./middleware/AuthMiddleware.js"));
if (DISABLE_CACHE) {
  app.use(require("./middleware/DisableCache"));
}

// express-handlebars & config
app.engine("handlebars", require("./middleware/Handlebars.js"));
app.set("view engine", "handlebars");
app.set("views", "./src/views");

// routers
app.use("/", require("./routes/testing.routes"));
app.use("/api/products", require("./routes/product.routes"));
app.use("/api/carts", require("./routes/cart.routes"));
app.use("/api/sessions", require("./routes/auth.routes"));
app.use("/api/users", require("./routes/users.routes.js"));
app.use("/api/tickets", require("./routes/tickets.routes.js"));
app.use("/", require("./routes/views.routes"));

const httpServer = app.listen(PORT, () => {
  logger.info(
    `${new Date().toUTCString()} | Server listening at ${
      HOSTNAME ? HOSTNAME : "localhost"
    }:${PORT}`,
  );
});

// socket.io logic
const socketIO = require("./socket-io")(httpServer);

// other middlewares
app.use(require("./middleware/UpdateSockets")(socketIO));
app.use(require("./middleware/NotFound"));
app.use(require("./middleware/ErrorHandler"));

require("./database");
