const mongo = require("mongoose");


const usersSchema = new mongo.Schema({
    first_name:{type:String, required:true},
    last_name:{type:String, required:false},
    age:{type:Number, required:false}, // not required because some external methods give no info about age
    email:{type:String, required:true, unique:true, index:true},
    password:{type:String, required:false}, // password isn't required because of external login methods like github and google 
    role:{type:String, required:true, default:"user"},
    cart:{type:mongo.SchemaTypes.ObjectId, ref:"Cart", required:true}
})


const Users = mongo.model("Users", usersSchema);

module.exports = Users;
