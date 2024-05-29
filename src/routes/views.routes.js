const Router = require("express").Router();
const ViewsController = require("../controllers/ViewsController");
const {
  viewsAdminAuth: adminAuth,
  viewsAuth: auth,
} = require("../controllers/AuthController");

Router.get("/", auth, ViewsController.products);
Router.get("/products", ViewsController.products);
Router.get(
  "/realtimeproducts",
  auth,
  adminAuth,
  ViewsController.realTimeProducts
);
Router.get("/carts/:cid", auth, ViewsController.carts);
Router.get("/carts", auth, ViewsController.carts);
Router.get("/cart", auth, ViewsController.carts);
Router.get("/login", ViewsController.login);
Router.get("/register", ViewsController.register);
Router.get("/profile", auth, ViewsController.profile);
Router.get("/logout", ViewsController.logout);
Router.get("/chat", auth, ViewsController.chat);

module.exports = Router;
