const Message = require("../models/Message");

function processMessage(message) {
  message = message.replace(/(<|>)/gi, "");
  message = message.trim();
  return message;
}
async function addMessage(user, message) {
  message = processMessage(message);
  return await Message.create({ user: user.email, message });
}
async function userOwnsMessage(username, messageId) {
  const message = await Message.findById(messageId);
  if (!message) {
    throw new Error(`Message not found`);
  }
  return message.user === username;
}
async function deleteMessage(id) {
  const message = await Message.findByIdAndDelete(id);
  if (!message) {
    throw new Error(`Message not found`);
  }
  return message;
}
async function updateMessage(id, newMessage, user) {
  newMessage = processMessage(newMessage);
  const message = await Message.findById(id);
  if (!message) {
    throw new Error(`Message not found`);
  }
  message.message = newMessage;
  return await message.save();
}
async function getMessages() {
  return await Message.find().lean();
}
module.exports = {
  getMessages,
  addMessage,
  processMessage,
  deleteMessage,
  updateMessage,
  userOwnsMessage,
};
