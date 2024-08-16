const Router = require("express").Router();
const UserController = require("../controllers/UserController");
const { checkRoles } = require("../controllers/AuthController");
const loggedin = checkRoles(["any"]);
const notloggedin = checkRoles(["notloggedin"]);
const admin = checkRoles(["admin"]);
const multer = require("../middleware/Multer");

Router.get("/premium/:uid", loggedin, UserController.togglePremium);
Router.get("/:uid/documents/:filename", loggedin, UserController.getDocument);
Router.post(
  "/sendresetpassword",
  notloggedin,
  UserController.requestPasswordReset,
);
Router.post("/resetpassword", notloggedin, UserController.resetPassword);
Router.post(
  "/:uid/documents",
  loggedin,
  multer.fields([
    { name: "ID", count: 1 },
    { name: "address_proof", count: 1 },
    { name: "account_status_proof", count: 1 },
  ]),
  UserController.uploadDocuments,
);
Router.post(
  "/:uid/avatar",
  loggedin,
  multer.single("avatar"),
  UserController.uploadAvatar,
);
Router.delete("/:uid", admin, UserController.deleteUser);
Router.delete("/", admin, UserController.deleteInactiveUsers);
Router.get("/", admin, UserController.getUsersPaginated);
Router.put("/:uid/role/:role", admin, UserController.updateRole);
Router.get(
  "/:uid/tokens",
  loggedin,
  UserController.isSameUserOrAdmin,
  UserController.getUserTokens,
);
Router.delete(
  "/:uid/tokens",
  loggedin,
  UserController.isSameUserOrAdmin,
  UserController.deleteTokens,
);
Router.delete(
  "/:uid/tokens/:tokenId",
  loggedin,
  UserController.isSameUserOrAdmin,
  UserController.deleteToken,
);

module.exports = Router;
