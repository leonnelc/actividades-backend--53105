const mongo = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");

const usersSchema = new mongo.Schema({
  first_name: { type: String, required: true },
  last_name: { type: String, required: false },
  age: { type: Number, required: false }, // not required because some external methods give no info about age
  email: { type: String, required: true, unique: true, index: true },
  password: { type: String, required: false }, // password isn't required because of external login methods like github and google
  avatar: { type: String, required: false },
  role: { type: String, required: true, default: "user" },
  cart: {
    type: mongo.SchemaTypes.ObjectId,
    ref: "Cart",
    required: false,
    unique: true,
    index: true,
  },
  documents: {
    type: [
      {
        name: { type: String, required: true },
        reference: { type: String, required: true },
        _id: false,
      },
    ],
    default: [],
  },
  last_connection: { type: Date, default: new Date(0) }, // Date(0) allows backwards compatibility
});

usersSchema.plugin(mongoosePaginate);

const User = mongo.model("User", usersSchema);

module.exports = User;
