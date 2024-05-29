const mongo = require("mongoose");

const usersSchema = new mongo.Schema({
    role:{type:String, required:true, default:"user"},
    email:{type:String, required:true, unique:true, index:true},
    first_name:{type:String, required:true},
    last_name:{type:String, required:true},
    age:{type:Number, required:true},
    password:{type:String, required:true},
})


const Users = mongo.model("Users", usersSchema);

module.exports = Users;
