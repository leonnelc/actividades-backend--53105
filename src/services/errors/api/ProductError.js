const APIError = require("../APIError");
class ProductError extends APIError {
  constructor(message, info = { name: "ProductError", data: undefined }) {
    info = { ...{ name: "ProductError", data: null }, ...info };
    super(message, { name: info.name, data: info.data });
  }
}

module.exports = ProductError;
