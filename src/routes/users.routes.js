const Router = require("express").Router();
const UserController = require("../controllers/UserController");
const { checkRoles } = require("../controllers/AuthController");
const checkAdmin = checkRoles(["admin"]);
const notloggedin = checkRoles(["notloggedin"]);

Router.get("/premium/:uid", checkAdmin, UserController.togglePremium);
Router.post(
  "/sendresetpassword",
  notloggedin,
  UserController.requestPasswordReset,
);
Router.post("/resetpassword", notloggedin, UserController.resetPassword);

module.exports = Router;
