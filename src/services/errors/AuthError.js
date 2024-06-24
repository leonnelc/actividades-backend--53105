const CustomError = require("./CustomError");
class AuthError extends CustomError {
  constructor(message, info = { name: "AuthError", data: null }) {
    info = { ...{ name: "AuthError", data: null }, ...info };
    super(message, info);
  }
}

module.exports = AuthError;
