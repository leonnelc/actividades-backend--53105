const Cart = require("../models/Cart");
const Product = require("../models/Product"); // needed to add products to cart
const mongoose = require("mongoose");

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
  return cart;
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
  return cart;
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
  return cart;
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
  return cart;
}
async function purchase(cid) {
  const cart = await getCartById(cid);
  return await purchaseCart(cart);
}
async function purchaseCart(cart) {
  // uses a cart document as argument, not cart id
  if (cart.items.size === 0) {
    throw new Error(`Can't purchase an empty cart`);
  }
  const errors = [];
  const purchased = [];
  const products = [];
  cart.items.forEach(async (item, productId) => {
    if (item.product.stock < item.quantity) {
      errors.push({
        id: productId,
        stock: item.product.stock,
        requiredStock: item.quantity,
      });
      cart.total =
        Math.round(
          (cart.total - (item.product.price * item.quantity + Number.EPSILON)) *
            100
        ) / 100; // magic formula to substract and round perfectly to 2 decimal places
      return;
    }
    item.product.stock -= item.quantity;
    purchased.push({ id: productId, quantity: item.quantity });
    products.push(item.product);
    cart.items.delete(productId);
  });
  if (purchased.length === 0) {
    const error = new Error(`No items can be purchased`);
    error.name = "NoPurchasedItems";
    error.items = errors;
    throw error;
  }
  /* uncomment this to throw error when an item is out of stock
  if (errors.length > 0) {
    const err = new Error(`Not enough stock`);
    err.name = "NotEnoughStock";
    err.items = errors;
    throw err;
  }*/
  const session = await mongoose.startSession();
  try {
    session.withTransaction(async () => {
      products.forEach(async (product) => await product.save());
      await cart.save();
    });
  } catch (error) {
    throw error;
  } finally {
    session.endSession();
  }
  return { not_purchased: errors, purchased };
}

module.exports = {
  getCarts,
  addCart,
  addProduct,
  getCartById,
  clearCart,
  removeProduct,
  updateQuantity,
  updateQuantityMany,
  purchase,
  purchaseCart,
};
