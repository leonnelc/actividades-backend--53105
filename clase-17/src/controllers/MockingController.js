const MockingService = require("../services/MockingService");
async function mockingProducts(req, res) {
  res.json({
    status: "success",
    products: MockingService.createMultipleProducts(100),
  });
}
module.exports = { mockingProducts };
