const Router = require("express").Router();
const ViewsController = require("../controllers/ViewsController");
const { checkRoles } = require("../controllers/AuthController");
const requireAuth = checkRoles(["any"], { isView: true });
const adminOrPremium = checkRoles(["admin", "premium"], { isView: true });
const notloggedin = checkRoles(["notloggedin"], { isView: true });

Router.get("/", ViewsController.products);
Router.get("/products", ViewsController.products);
Router.get(
  "/realtimeproducts",
  adminOrPremium,
  ViewsController.realTimeProducts,
);
Router.get("/carts/:cid", requireAuth, ViewsController.carts);
Router.get("/carts", requireAuth, ViewsController.carts);
Router.get("/cart", requireAuth, ViewsController.carts);
Router.get("/login", notloggedin, ViewsController.login);
Router.get("/register", notloggedin, ViewsController.register);
Router.get("/profile", requireAuth, ViewsController.profile);
Router.get("/logout", ViewsController.logout);
Router.get("/chat", requireAuth, ViewsController.chat);
Router.get("/resetpassword", notloggedin, ViewsController.resetPassword);

module.exports = Router;
