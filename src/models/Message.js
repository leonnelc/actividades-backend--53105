const mongo = require("mongoose");

const stringRequired = {type: String, required:true};
const messagesSchema = new mongo.Schema({
    user: stringRequired,
    message: stringRequired
});

const Messages = mongo.model("Messages", messagesSchema);

module.exports = Messages;