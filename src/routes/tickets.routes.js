const Router = require("express").Router();
const TicketController = require("../controllers/TicketController");
const { checkRoles } = require("../controllers/AuthController");
const admin = checkRoles(["admin"]);
const loggedin = checkRoles(["any"]);

Router.get("/", admin, TicketController.getTicketsPaginated);
Router.get("/:userEmail", loggedin, TicketController.getUserTicketsPaginated);

module.exports = Router;
