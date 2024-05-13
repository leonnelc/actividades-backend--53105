const express = require("express");
const mongo = require("mongoose");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const passport = require("passport");
const initializePassport = require("./config/passport.config");
const {
  PORT,
  HOSTNAME,
  MONGO_URL,
  SESSION_SECRET,
} = require("./config/config");

const app = express();

const productRouter = require("./routes/product.routes");
const cartRouter = require("./routes/cart.routes");
const viewsRouter = require("./routes/views.routes");
const authRouter = require("./routes/auth.routes");
const exphbs = require("express-handlebars");

// middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const sessionMiddleware = session({
  secret: SESSION_SECRET,
  resave: true,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: MONGO_URL,
    ttl: 86400,
  }),
});
app.use(sessionMiddleware);
initializePassport();
app.use(express.static("./src/public")); // Needs to be before passport to avoid deserialization when accessing static files
app.use(passport.initialize());
app.use(passport.session());

// express-handlebars & config
app.engine("handlebars", exphbs.engine());
app.set("view engine", "handlebars");
app.set("views", "./src/views");

// routers
app.use("/api/products", productRouter);
app.use("/api/carts", cartRouter);
app.use("/api/sessions", authRouter);
app.use("/", viewsRouter);

// other middlewares
app.use((req, res, next) => {
  // this is used to send updates to clients using websockets
  if (!res.locals.send || !res.locals.products) {
    return next();
  }
  res.send(res.locals.send);
  socketIO.emit("productList", res.locals.products);
});
app.use((req, res) => {
  // this renders a 404 not found error message when users try to request an invalid endpoint
  res.status(404).render("message", {
    message: "404 Page not found",
    error: true,
    title: "404 Not found",
  });
});
app.use((err, req, res, next) => {
  // this middleware is used to handle errors not catched by routers to avoid sending the error stack trace
  console.error(err);
  res
    .status(err.status)
    .render("message", { error: true, message: "An error has occurred ):" });
});

const httpServer = app.listen(PORT, () => {
  console.log(
    `Server listening at ${HOSTNAME ? HOSTNAME : "localhost"}:${PORT}`
  );
});

// socket.io logic
const socketIO = require("./socket-io")(httpServer, sessionMiddleware);

// connect to database

console.log("Connecting to database...");
mongo
  .connect(MONGO_URL)
  .then(() => {
    console.log("Success connecting to database");
  })
  .catch((reason) => {
    throw new Error(`Failure connecting to database, reason: \n${reason}`);
  });
