const APIError = require("../APIError");
class ProductError extends APIError {
  constructor(message, info = { name: "ProductError", data: undefined }) {
    super(message, { name: info.name, data: info.data });
  }
}

module.exports = ProductError;
