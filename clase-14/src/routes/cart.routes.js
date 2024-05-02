const Router = require("express").Router();
const { adminAuth, auth } = require("../controllers/AuthController");
const CartController = require("../controllers/CartController");

Router.get("/", adminAuth, CartController.getCarts);
Router.get("/:cid", auth, CartController.getCartById);
Router.get("/:cid/products/", auth, CartController.getProducts);
Router.post("/", adminAuth, CartController.addCart);
Router.post("/:cid/products/:pid", auth, CartController.addProduct);
Router.delete("/:cid", auth, CartController.clearCart);
Router.delete("/:cid/products/:pid", auth, CartController.removeProduct);
Router.put("/:cid", auth, CartController.updateQuantityMany);
Router.put("/:cid/products/:pid", auth, CartController.updateQuantity);
module.exports = Router;
