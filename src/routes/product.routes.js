const express = require("express");
const Router = express.Router();
const ProductController = require("../controllers/ProductController");
const { checkRoles } = require("../controllers/AuthController");
const requireAdmin = checkRoles(["admin"]);

Router.get("/", ProductController.getProducts);
Router.get("/:pid", ProductController.getById);
Router.get("/code/:code", ProductController.getByCode);
Router.post("/", requireAdmin, ProductController.add);
Router.delete("/:pid", requireAdmin, ProductController.deleteProduct);
Router.put("/:pid", requireAdmin, ProductController.update);

module.exports = Router;
