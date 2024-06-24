const express = require("express");
const Router = express.Router();
const ProductController = require("../controllers/ProductController");
const { checkRoles } = require("../controllers/AuthController");
const adminOrPremium = checkRoles(["admin", "premium"]);

Router.get("/", ProductController.getProducts);
Router.get("/:pid", ProductController.getById);
Router.get("/code/:code", ProductController.getByCode);
Router.post("/", adminOrPremium, ProductController.add);
Router.delete("/:pid", adminOrPremium, ProductController.deleteProduct);
Router.put("/:pid", adminOrPremium, ProductController.update);

module.exports = Router;
