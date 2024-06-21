const Router = require("express").Router();
const TestingController = require("../controllers/TestingController");

Router.get("/mockingproducts", TestingController.mockingProducts);
Router.get("/loggerTest", TestingController.loggerTest);
Router.get("/test", (req, res) => {
  res.render("message", {message:JSON.stringify(req.user)});
});

module.exports = Router;
