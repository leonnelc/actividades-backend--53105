const CustomError = require("./CustomError");
class APIError extends CustomError {
  constructor({ name = "APIError", message, data = null }) {
    super({ name, message, data });
  }
}

module.exports = APIError;
