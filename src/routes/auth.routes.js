const Router = require("express").Router();
const AuthController = require("../controllers/AuthController");
const { rateLimit } = require("express-rate-limit");
const checkRoles = AuthController.checkRoles;
const checkNotLoggedIn = checkRoles(["notloggedin"]);

Router.post(
  "/login",
  rateLimit({
    limit: 5,
    windowMs: 60 * 1000,
    message: { message: "Too many login attempts, try again in 1 minute." },
  }),
  checkNotLoggedIn,
  AuthController.loginLocal,
);
Router.post(
  "/register",
  rateLimit({
    limit: 5,
    windowMs: 60 * 1000,
    message: { message: "Too many register attempts, try again in 1 minute." },
  }),
  checkNotLoggedIn,
  AuthController.registerLocal,
);
Router.get("/google", AuthController.googleLogin);
Router.get("/google/callback", AuthController.googleCallback);
Router.get("/github", AuthController.githubLogin);
Router.get("/github/callback", AuthController.githubCallback);
Router.get("/current", AuthController.current);
Router.get("/logout", AuthController.logout);

module.exports = Router;
