const Users = require("../models/user.model");
const crypto = require("crypto");
const admins = new Map();
admins.set("admincoder@coder.com", "adminCod3r123");
class UserManager {
    constructor(){
        if (!UserManager.instance){
            UserManager.instance = this;
        }
        return UserManager.instance;
    }
    #hash(password){
        return crypto.createHash('sha256').update(password).digest('hex');
    }
    async getUserByEmail(email){
        try {
            return await Users.findOne({email});
        } catch (error) {
            return null;
        }
    }
    async addUser({email, password, age, first_name, last_name}){
        let user = await this.getUserByEmail(email);
        if (user != null || admins.has(email)){
            return {error:true, message:"User already exists"};
        }
        try {
            password = this.#hash(password);
            const newUser = await Users.create({email, password, age, first_name, last_name});
            return {error:false, user: await newUser.save()};
        } catch (error) {
            return {error:true, message:`Error adding user: ${error.message}`}
        }
    }
    async login(email, password){
        let user = {email:String(), password:String(), role:String(), age:Number(), first_name:String(), last_name:String()};
        if (admins.has(email)){
            user = {password:admins.get(email), role:"admin", age:0, first_name:"Admin", last_name:"Admin", email};
        } else{
            password = this.#hash(password);
            user = await this.getUserByEmail(email);
            if (user == null){
                return {result:false, message:"User does not exist"};
            }
        }
            if (!(user.password === password)){
                return {result:false, message:"Wrong password"};
            }
        return {result:true, user:user};
    }
}

module.exports = UserManager;