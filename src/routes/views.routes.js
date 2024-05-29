const Router = require("express").Router();
const ViewsController = require("../controllers/ViewsController");
const { checkRoles } = require("../controllers/AuthController");
const requireAuth = checkRoles(["user", "admin"], true);
const requireAdmin = checkRoles(["admin"], true);

Router.get("/", ViewsController.products);
Router.get("/products", ViewsController.products);
Router.get("/realtimeproducts", requireAdmin, ViewsController.realTimeProducts);
Router.get("/carts/:cid", requireAuth, ViewsController.carts);
Router.get("/carts", requireAuth, ViewsController.carts);
Router.get("/cart", requireAuth, ViewsController.carts);
Router.get("/login", ViewsController.login);
Router.get("/register", ViewsController.register);
Router.get("/profile", requireAuth, ViewsController.profile);
Router.get("/logout", ViewsController.logout);
Router.get("/chat", requireAuth, ViewsController.chat);

module.exports = Router;
