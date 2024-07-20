const Router = require("express").Router();
const UserController = require("../controllers/UserController");
const { checkRoles } = require("../controllers/AuthController");
const loggedin = checkRoles(["any"]);
const notloggedin = checkRoles(["notloggedin"]);
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
  UserController.multerUploadDocs.fields([
    { name: "ID", count: 1 },
    { name: "address_proof", count: 1 },
    { name: "account_status_proof", count: 1 },
  ]),
  UserController.uploadDocuments,
);
Router.post(
  "/:uid/avatar",
  loggedin,
  UserController.multerUploadAvatar,
  UserController.uploadAvatar,
);

module.exports = Router;
