const CustomError = require("./CustomError");
class APIError extends CustomError {
  constructor(message, info = { name: "APIError", data: null }) {
    info = { ...{ name: "APIError", data: null }, ...info };
    super(message, info);
  }
}

module.exports = APIError;
