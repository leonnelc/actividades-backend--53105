const CustomError = require("./CustomError");
class APIError extends CustomError {
  constructor(message, info = { name: "APIError", data: null }) {
    super(message, info);
  }
}

module.exports = APIError;
