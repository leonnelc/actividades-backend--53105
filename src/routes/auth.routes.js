const Router = require("express").Router();
const passport = require("passport");
const AuthController = require("../controllers/AuthController");

Router.post(
  "/login",
  passport.authenticate("login", { failureRedirect: "/login" }),
  AuthController.loginLocal
);
Router.post(
  "/register",
  passport.authenticate("register", {
    failureRedirect: "/register",
  }),
  AuthController.registerLocal
);
Router.get(
  "/google",
  passport.authenticate("google", {
    failureRedirect: "/login",
    scope: ["profile", "email"],
  }),
  AuthController.loginGoogle
);
Router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/login" }),
  AuthController.callbackGoogle
);
Router.get(
  "/github",
  passport.authenticate("github", {
    scope: ["user:email"],
    failureRedirect: "/login",
  }),
  AuthController.loginGithub
);
Router.get(
  "/github/callback",
  passport.authenticate("github", { failureRedirect: "/login" }),
  AuthController.callbackGithub
);
Router.get("/current", AuthController.current);
Router.get("/logout", AuthController.logout);

module.exports = Router;
