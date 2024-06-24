const APIError = require("../APIError");
class CartError extends APIError {
  constructor(message, info = { name: "CartError", data: null }) {
    info = { ...{ name: "CartError", data: null }, ...info };
    super(message, info);
  }
}

module.exports = CartError;
