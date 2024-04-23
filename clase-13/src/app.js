const express = require("express");
const mongo = require("mongoose");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const passport = require("passport");
const initializePassport = require("./config/passport.config");
const { PORT, HOSTNAME, MONGO_URL } = require("./config/config");

const app = express();

const productsRouter = require("./routes/products.router");
const cartsRouter = require("./routes/carts.router");
const viewsRouter = require("./routes/views.router");
const sessionsRouter = require("./routes/sessions.router");
const exphbs = require("express-handlebars");

// middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  session({
    secret: "secretCoder",
    resave: true,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl:
        MONGO_URL,
      ttl: 86400,
    }),
  })
);
initializePassport();
app.use(passport.initialize());
app.use(passport.session());

// express-handlebars & config
app.engine("handlebars", exphbs.engine());
app.set("view engine", "handlebars");
app.set("views", "./src/views");

// routers
app.use(express.static("./src/public"));
app.use("/api/products", productsRouter);
app.use("/api/carts", cartsRouter);
app.use("/api/sessions", sessionsRouter);
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
  res
    .status(404)
    .render("message", { message: "404 Page not found", error: true });
});
app.use((err, req, res, next) => {
  // this middleware is used to handle errors not catched by routers and avoid sending the error stack trace
  console.error(err);
  res
    .status(err.status)
    .render("message", { error: true, message: "An error has occurred ):" });
});

const httpServer = app.listen(PORT, () => {
  console.log(`Server listening at ${HOSTNAME ? HOSTNAME:"localhost"}:${PORT}`);
});

// socket.io logic
const socketIO = require("./socket-io")(httpServer);

// connect to database

console.log("Connecting to database...");
mongo
  .connect(MONGO_URL)
  .then(async () => {
    console.log("Success connecting to database");
  })
  .catch((reason) => {
    throw new Error(`Failure connecting to database, reason: \n${reason}`);
  });
