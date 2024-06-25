const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const cartSchema = new Schema({
  items: {
    type: Map,
    of: {
      product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
      quantity: { type: Number, required: true, default: 1 },
    },
    default: {},
  },
  owner: { type: String, required: false }, // the email of the user that owns the cart
  total: { type: Number, default: 0 },
});
cartSchema.pre("findOne", function (next) {
  this.populate("items.$*.product");
  next();
});
// Calculate total and delete invalid items before saving
cartSchema.pre("save", async function (next) {
  this.populate("items.$*.product");
  this.total = 0;
  this.items.forEach((item, id) => {
    if (item.product == null || item.quantity <= 0) {
      return this.items.delete(id);
    }
    this.total =
      Math.round(
        (this.total + (item.product.price * item.quantity + Number.EPSILON)) *
          100,
      ) / 100; // this black magic rounds to 2 decimal places
  });
  next();
});

const Cart = mongoose.model("Cart", cartSchema);
module.exports = Cart;
