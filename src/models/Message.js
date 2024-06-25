const mongo = require("mongoose");

const stringRequired = { type: String, required: true };
const messagesSchema = new mongo.Schema({
  user: stringRequired,
  message: stringRequired,
});

const Message = mongo.model("Message", messagesSchema);

module.exports = Message;

