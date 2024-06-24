const APIError = require("../APIError");
class ChatError extends APIError {
  constructor(message, info = { name: "ChatError", data: null }) {
    info = { ...{ name: "ChatError", data: null }, ...info };
    super(message, info);
  }
}

module.exports = ChatError;
