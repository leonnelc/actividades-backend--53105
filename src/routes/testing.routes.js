const Router = require("express").Router();
const TestingController = require("../controllers/TestingController");

Router.get("/mockingproducts", TestingController.mockingProducts);
Router.get("/loggerTest", TestingController.loggerTest);


module.exports = Router;
