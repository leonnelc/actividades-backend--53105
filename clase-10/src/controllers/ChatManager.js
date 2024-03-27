const Messages = require("../models/messages.model");

class ChatManager{
    static processMessage(message){
        message = message.replace(/(<|>)/ig, '');
        message = message.trim();
        return message;
    }
    static async addMessage(username, message){
        try {
            message = new Messages({user:username, message:message});
            await message.save();
            return true
        } catch (error) {
            console.log(error);
            return false;
        }
    }
    static async getMessages(){
        try {
            return await Messages.find().lean();
        } catch (error) {
            console.log(error);
            return [];
        }
    }
}

module.exports = ChatManager;