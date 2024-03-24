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
cartSchema.pre("findOne", function(next){
  this.populate("items.product");
  next();
});
cartSchema.post('findOne', async function(doc) {
  // removes null products (products with wrong references or that were deleted after being added to the cart)
  if (doc) {
    const updatedItems = doc.items.filter(item => item.product !== null);
    doc.items = updatedItems;
    await doc.save();
  }
});


const Cart = mongoose.model('Cart', cartSchema);

module.exports = Cart;