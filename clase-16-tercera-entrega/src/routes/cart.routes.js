const Router = require("express").Router();
const { checkRoles } = require("../controllers/AuthController");
const CartController = require("../controllers/CartController");

const requireAdmin = checkRoles(["admin"]);
const userOnly = checkRoles(["user"]);
const requireAuth = checkRoles(["user", "admin"]);

Router.get("/", requireAdmin, CartController.getCarts);
Router.get("/:cid", requireAuth, CartController.getCartById);
Router.get("/:cid/products/", requireAuth, CartController.getProducts);
Router.post("/", requireAdmin, CartController.addCart);
Router.post("/:cid/products/:pid", requireAuth, CartController.addProduct);
Router.post("/:cid/purchase", userOnly, CartController.purchase);
Router.delete("/:cid", requireAuth, CartController.clearCart);
Router.delete("/:cid/products/:pid", requireAuth, CartController.removeProduct);
Router.put("/:cid", requireAuth, CartController.updateQuantityMany);
Router.put("/:cid/products/:pid", requireAuth, CartController.updateQuantity);
module.exports = Router;
