const CustomError = require("./CustomError");
class ViewError extends CustomError {
  constructor({ name = "ViewError", message, data = null }) {
    super({ name, message, data });
  }
}

module.exports = ViewError;
