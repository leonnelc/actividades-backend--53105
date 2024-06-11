const MockingService = require("../services/MockingService");
async function mockingProducts(_req, res) {
  res.json({
    status: "success",
    products: MockingService.createMultipleProducts(100),
  });
}
async function loggerTest(req, res) {
  const { fatal, error, warning, info, http, debug, message } = req.query;
  if (fatal)
    req.logger.fatal(
      `${new Date().toUTCString()} | ${message ?? "Test fatal log"}`,
    );
  if (error)
    req.logger.error(
      `${new Date().toUTCString()} | ${message ?? "Test error log"}`,
    );
  if (warning)
    req.logger.warning(
      `${new Date().toUTCString()} | ${message ?? "Test warning log"}`,
    );
  if (info)
    req.logger.info(
      `${new Date().toUTCString()} | ${message ?? "Test info log"}`,
    );
  if (http)
    req.logger.http(
      `${new Date().toUTCString()} | ${message ?? "Test http log"}`,
    );
  if (debug)
    req.logger.debug(
      `${new Date().toUTCString()} | ${message ?? "Test debug log"}`,
    );
  res.render("loggerTest");
}
module.exports = { mockingProducts, loggerTest };
