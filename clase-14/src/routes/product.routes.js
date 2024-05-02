const express = require("express");
const Router = express.Router();
const ProductController = require("../controllers/ProductController");
const { adminAuth } = require("../controllers/AuthController");

Router.get("/", ProductController.getProducts);
Router.get("/:pid", ProductController.getById);
Router.get("/code/:code", ProductController.getByCode);
Router.post("/", adminAuth, ProductController.add);
Router.delete("/:pid", adminAuth, ProductController.deleteProduct);
Router.put("/:pid", adminAuth, ProductController.update);

module.exports = Router;
