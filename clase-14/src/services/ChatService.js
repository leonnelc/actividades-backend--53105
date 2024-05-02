const Message = require("../models/Message");

function processMessage(message) {
  message = message.replace(/(<|>)/gi, "");
  message = message.trim();
  return message;
}
async function addMessage(user, message) {
  await Message.create({ user, message });
  return true;
}
async function getMessages() {
  return await Message.find().lean();
}
module.exports = { getMessages, addMessage, processMessage };
