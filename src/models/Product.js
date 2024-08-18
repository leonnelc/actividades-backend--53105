const mongo = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");

const stringRequired = { type: String, required: true };
const numRequired = { type: Number, required: true };
const productsSchema = new mongo.Schema({
  title: stringRequired,
  owner: {
    type: mongo.SchemaTypes.ObjectId,
    ref: "User",
    required: false,
    unique: true,
    index: true,
    default: null,
  },
  description: stringRequired,
  category: { type: String, required: true, index: true },
  price: numRequired,
  stock: numRequired,
  images: {type: [String], default: []},
  thumbnail: { type: String, default: "/images/404-not-found.jpg", required: true },
  status: { type: Boolean, default: true, required: true, index: true },
  code: {
    type: String,
    required: true,
    unique: true,
  },
});

productsSchema.pre("save", function (next) {
  this.status = this.stock > 0;
  next();
});

productsSchema.plugin(mongoosePaginate);

const Product = mongo.model("Product", productsSchema);

module.exports = Product;
