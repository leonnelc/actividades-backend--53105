const Router = require("express").Router();
const AuthController = require("../controllers/AuthController");
const checkRoles = AuthController.checkRoles;
const checkNotLoggedIn = checkRoles(["notloggedin"]);

Router.post("/login", checkNotLoggedIn, AuthController.loginLocal);
Router.post("/register", checkNotLoggedIn, AuthController.registerLocal);
Router.get("/google", AuthController.googleLogin);
Router.get("/google/callback", AuthController.googleCallback);
Router.get("/github", AuthController.githubLogin);
Router.get("/github/callback", AuthController.githubCallback);
Router.get("/current", AuthController.current);
Router.get("/logout", AuthController.logout);

module.exports = Router;
