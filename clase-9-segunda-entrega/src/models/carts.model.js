const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const cartItemSchema = new Schema({
  productId: { type: Schema.Types.ObjectId, ref: 'product', required: true },
  quantity: { type: Number, required: true, default: 1 }
});

const cartSchema = new Schema({
  items: [cartItemSchema],
  total: { type: Number, default: 0 }
});

const Cart = mongoose.model('Cart', cartSchema);

module.exports = Cart;