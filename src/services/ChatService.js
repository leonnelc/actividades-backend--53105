const Message = require("../models/Message");
const ChatError = require("./errors/api/ChatError");

function processMessage(message) {
  message = message?.replace(/(<|>)/gi, "");
  message = message?.trim();
  if (!message) {
    throw new ChatError(`Invalid message`);
  }
  return message;
}
async function addMessage(user, message) {
  message = processMessage(message);
  return await Message.create({ user: user.email, message });
}
async function userOwnsMessage(username, messageId) {
  const message = await Message.findById(messageId);
  if (!message) {
    throw new ChatError(`Message not found`);
  }
  return message.user === username;
}
async function deleteMessage(id) {
  const message = await Message.findByIdAndDelete(id);
  if (!message) {
    throw new ChatError(`Message not found`);
  }
  return message;
}
async function updateMessage(id, newMessage, user) {
  newMessage = processMessage(newMessage);
  const message = await Message.findById(id);
  if (!message) {
    throw new ChatError(`Message not found`);
  }
  if (message.user != user.email && user.role != "admin") {
    throw new ChatError(`Not authorized to update message`);
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
