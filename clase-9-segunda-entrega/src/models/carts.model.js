const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const cartItemSchema = new Schema({
  product: { type: Schema.Types.ObjectId, ref: 'Products', required: true },
  quantity: { type: Number, required: true, default: 1 },
  _id: false
});

const cartSchema = new Schema({
  items: [cartItemSchema],
  total: { type: Number, default: 0 }
});

cartSchema.pre("find", function(next){
  console.log("pre");
  this.populate("items.product");
  next();
});

const Cart = mongoose.model('Cart', cartSchema);

module.exports = Cart;