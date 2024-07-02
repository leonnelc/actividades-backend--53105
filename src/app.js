const express = require("express");
const passport = require("passport");
const initializePassport = require("./config/passport.config");
const { addLogger, logger, enableDebugLogging } = require("./utils/logger.js");
const { PORT, HOSTNAME, DEBUGGING } = require("./config/config");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./swagger");

if (DEBUGGING) {
  enableDebugLogging();
  logger.info(`${new Date().toUTCString()} | Debugging logs enabled`);
}
const app = express();

const exphbs = require("express-handlebars");

initializePassport();

// middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("./src/public")); // Needs to be before passport
app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, { customCssUrl: "/css/swaggerDark.css" }),
);
app.use(require("cookie-parser")());
app.use(addLogger);
app.use(passport.initialize());
app.use(require("./middleware/AuthMiddleware.js"));

// express-handlebars & config
app.engine(
  "handlebars",
  exphbs.engine({
    handlebars:
      require("@handlebars/allow-prototype-access").allowInsecurePrototypeAccess(
        require("handlebars"),
      ),
  }),
);
app.set("view engine", "handlebars");
app.set("views", "./src/views");

// routers
app.use("/", require("./routes/testing.routes"));
app.use("/api/products", require("./routes/product.routes"));
app.use("/api/carts", require("./routes/cart.routes"));
app.use("/api/sessions", require("./routes/auth.routes"));
app.use("/api/users", require("./routes/users.routes.js"));
app.use("/", require("./routes/views.routes"));

// other middlewares
app.use(require("./middleware/UpdateSockets")(socketIO));
app.use(require("./middleware/NotFound"));
app.use(require("./middleware/ErrorHandler"));

const httpServer = app.listen(PORT, () => {
  logger.info(
    `${new Date().toUTCString()} | Server listening at ${
      HOSTNAME ? HOSTNAME : "localhost"
    }:${PORT}`,
  );
});

// socket.io logic
var socketIO = require("./socket-io")(httpServer);

require("./database");
