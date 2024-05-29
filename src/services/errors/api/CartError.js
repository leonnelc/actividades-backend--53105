const APIError = require("../APIError");
class CartError extends APIError {
  constructor(message, info = { name: "CartError", data: null }) {
    super(message, info);
  }
}

module.exports = CartError;
