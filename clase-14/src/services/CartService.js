const Cart = require("../models/Cart");
const Product = require("../models/Product"); // needed to add products to cart

async function getCarts() {
  return await Cart.find();
}
async function addCart(owner) {
  if (owner) {
    return await Cart.create({ owner });
  }
  return await Cart.create({});
}
async function getCartById(cid) {
  const cart = await Cart.findById(cid);
  if (!cart) {
    throw new Error(`Cart id ${cid} not found`);
  }
  return cart;
}
async function addProduct(cid, pid, quantity) {
  const cart = await Cart.findById(cid);
  if (!cart) {
    throw new Error(`Cart id ${cid} not found`);
  }
  const product = await Product.findById(pid);
  if (!product) {
    throw new Error(`Product id ${pid} not found`);
  }
  if (!product.status) {
    throw new Error(`Product is not available`);
  }
  const cartItem = cart.items.get(pid);
  if (cartItem) {
    cartItem.quantity += quantity;
  } else {
    cart.items.set(pid, { product, quantity });
  }
  await cart.save();
}
async function removeProduct(cid, pid) {
  const cart = await Cart.findById(cid);
  if (!cart) {
    throw new Error(`Cart id ${cid} not found`);
  }
  if (!cart.items.has(pid)) {
    throw new Error(`Product id ${pid} not found in cart id ${cid}`);
  }
  cart.items.delete(pid);
  await cart.save();
}
async function getProducts(cid) {
  const cart = await Cart.findById(cid);
  if (!cart) {
    throw new Error(`Cart id ${cid} not found`);
  }
  return [...cart.items.values];
}
async function clearCart(cid) {
  const cart = await Cart.findById(cid);
  if (!cart) {
    throw new Error(`Cart id ${cid} not found`);
  }
  cart.items = {};
  await cart.save();
}
async function updateQuantity(cid, pid, quantity) {
  const cart = await Cart.findById(cid);
  if (!cart) {
    throw new Error(`Cart id ${cid} not found`);
  }
  if (!cart.items.has(pid)) {
    throw new Error(`Product id ${pid} not found in cart id ${cid}`);
  }
  if (quantity > 0) {
    cart.items.get(pid).quantity = quantity;
  } else {
    cart.items.delete(pid);
  }
  await cart.save();
}
async function updateQuantityMany(cid, items) {
  const cart = await Cart.findById(cid);
  if (!cart) {
    throw new Error(`Cart id ${cid} not found`);
  }

  for (let obj of items) {
    if (obj.product == null || obj.quantity == null) {
      throw new Error(
        `Objects must contain the properties product and quantity`
      );
    }
    if (!cart.items.has(obj.product)) {
      throw new Error(`Product id ${obj.product} not found in cart id ${cid}`);
    }
    if (obj.quantity <= 0) {
      cart.items.delete(obj.product);
      continue;
    }
    cart.items.get(obj.product).quantity = obj.quantity;
  }
  await cart.save();
}

module.exports = {
  getCarts,
  addCart,
  addProduct,
  getProducts,
  getCartById,
  clearCart,
  removeProduct,
  updateQuantity,
  updateQuantityMany,
};
