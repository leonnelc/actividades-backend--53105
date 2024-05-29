const Router = require("express").Router();
const MockingController = require("../controllers/MockingController");

Router.get("/mockingproducts", MockingController.mockingProducts);

module.exports = Router;
