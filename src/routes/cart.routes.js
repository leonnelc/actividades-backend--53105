const Router = require("express").Router();
const { checkRoles } = require("../controllers/AuthController");
const CartController = require("../controllers/CartController");

const checkAdmin = checkRoles(["admin"]);
const userOrPremium = checkRoles(["user", "premium"]);
const checkAny = checkRoles(["any"]);

Router.get("/", checkAdmin, CartController.getCarts);
Router.get("/:cid", checkAny, CartController.getCartById);
Router.get("/:cid/products/", checkAny, CartController.getProducts);
Router.post("/", checkAdmin, CartController.addCart);
Router.post("/:cid/products/:pid", checkAny, CartController.addProduct);
Router.post("/:cid/purchase", userOrPremium, CartController.purchase);
Router.delete("/:cid", checkAny, CartController.clearCart);
Router.delete("/:cid/products/:pid", checkAny, CartController.removeProduct);
Router.put("/:cid", checkAny, CartController.updateQuantityMany);
Router.put("/:cid/products/:pid", checkAny, CartController.updateQuantity);
module.exports = Router;
