const express = require("express");
const multer = require("../middleware/Multer");
const Router = express.Router();
const ProductController = require("../controllers/ProductController");
const { checkRoles } = require("../controllers/AuthController");
const adminOrPremium = checkRoles(["admin", "premium"]);

Router.get("/", ProductController.getProductsPaginated);
Router.get("/:pid", ProductController.getById);
Router.get("/code/:code", ProductController.getByCode);
Router.post("/", adminOrPremium, ProductController.add);
Router.delete("/:pid", adminOrPremium, ProductController.deleteProduct);
Router.put("/:pid", adminOrPremium, ProductController.update);
Router.post(
  "/:pid/images",
  adminOrPremium,
  ProductController.isProductOwnerOrAdmin,
  multer.single("productImage"),
  ProductController.uploadProductImage,
);
Router.delete(
  "/:pid/images/:image",
  adminOrPremium,
  ProductController.isProductOwnerOrAdmin,
  ProductController.deleteProductImage,
);

module.exports = Router;
