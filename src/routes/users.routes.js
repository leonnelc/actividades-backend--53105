const Router = require("express").Router();
const UserController = require("../controllers/UserController");
const { checkRoles } = require("../controllers/AuthController");
const checkAdmin = checkRoles(["admin"]);

Router.get("/premium/:uid", checkAdmin, UserController.togglePremium);

module.exports = Router;
