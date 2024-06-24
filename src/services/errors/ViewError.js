const CustomError = require("./CustomError");
class ViewError extends CustomError {
  constructor(message, info = { name: "ViewError", data: undefined }) {
    info = { ...{ name: "ViewError", data: null }, ...info };
    super(message, { name: info.name, data: info.data });
  }
}

module.exports = ViewError;
