const mongo = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");

const stringRequired = { type: String, required: true };
const numRequired = { type: Number, required: true };
const productsSchema = new mongo.Schema({
  title: stringRequired,
  description: stringRequired,
  category: { type: String, required: true, index: true },
  price: numRequired,
  stock: numRequired,
  thumbnails: { type: [String], default: [], required: true },
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

const Products = mongo.model("Products", productsSchema);

module.exports = Products;
