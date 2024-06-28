const CartService = require("../services/CartService");
const TicketService = require("../services/TicketService");
const UserService = require("../services/UserService");
const ProductService = require("../services/ProductService");
const { sendSuccess } = require("./ControllerUtils");
const CartError = require("../services/errors/api/CartError");
const CartDTO = require("../dtos/CartDTO");
function checkOwnsCartOrIsAdmin(req, cid) {
  const user = req.user;
  if (user.cart == cid || user.role == "admin") {
    return;
  }
  throw new CartError("Not authorized to access this cart");
}
function checkOwnsCart(req, cid) {
  const user = req.user;
  if (user.cart != cid) {
    throw new CartError("User doesn't own cart");
  }
}

async function getCarts(req, res, next) {
  try {
    const carts = (await CartService.getCarts()).map(
      (cart) => new CartDTO(cart)
    );
    sendSuccess(res, { carts });
  } catch (error) {
    next(error);
  }
}
async function addCart(req, res, next) {
  try {
    const owner = req.query.owner;
    const cart = new CartDTO(await CartService.addCart(owner));
    sendSuccess(res, { cart });
  } catch (error) {
    next(error);
  }
}
async function addProduct(req, res, next) {
  try {
    const { cid, pid } = req.params;
    checkOwnsCartOrIsAdmin(req, cid);
    const product = await ProductService.getProductById(pid);
    if (req.user.id == product.owner) {
      throw new CartError("Can't add owned product to cart");
    }

    let quantity = parseInt(req.query.quantity);
    if (!req.query.quantity) {
      quantity = 1;
    }
    if (!Number.isInteger(quantity) || quantity <= 0) {
      throw new CartError("Invalid quantity query, must be a positive integer");
    }
    const cart = new CartDTO(await CartService.addProduct(cid, pid, quantity));
    sendSuccess(res, { cart });
  } catch (error) {
    next(error);
  }
}
async function getCartById(req, res, next) {
  try {
    const { cid } = req.params;
    checkOwnsCartOrIsAdmin(req, cid);
    const cart = new CartDTO(await CartService.getCartById(cid));
    sendSuccess(res, { cart });
  } catch (error) {
    next(error);
  }
}
async function clearCart(req, res, next) {
  try {
    const { cid } = req.params;
    checkOwnsCartOrIsAdmin(req, cid);
    await CartService.clearCart(cid);
    sendSuccess(res, {});
  } catch (error) {
    next(error);
  }
}
async function removeProduct(req, res, next) {
  try {
    const { cid, pid } = req.params;
    checkOwnsCartOrIsAdmin(req, cid);
    const cart = new CartDTO(await CartService.removeProduct(cid, pid));
    sendSuccess(res, { cart });
  } catch (error) {
    next(error);
  }
}
async function updateQuantity(req, res, next) {
  try {
    const { cid, pid } = req.params;
    checkOwnsCartOrIsAdmin(req, cid);
    const quantity = parseInt(req.body.quantity);
    if (!Number.isInteger(quantity)) {
      throw new CartError("Quantity not specified or isn't an integer");
    }
    const cart = new CartDTO(
      await CartService.updateQuantity(cid, pid, quantity)
    );
    sendSuccess(res, { cart });
  } catch (error) {
    next(error);
  }
}
async function updateQuantityMany(req, res, next) {
  try {
    const { cid } = req.params;
    checkOwnsCartOrIsAdmin(req, cid);
    if (!Array.isArray(req.body)) {
      throw new CartError(
        "Request body must be an array containing objects in the format {product:productId, quantity:Number}"
      );
    }
    const cart = new CartDTO(
      await CartService.updateQuantityMany(cid, req.body)
    );
    sendSuccess(res, { cart });
  } catch (error) {
    next(error);
  }
}
async function getProducts(req, res, next) {
  try {
    const { cid } = req.params;
    checkOwnsCartOrIsAdmin(req, cid);
    const products = new CartDTO(await CartService.getCartById(cid)).products;
    sendSuccess(res, { products });
  } catch (error) {
    next(error);
  }
}
// eslint-disable-next-line no-unused-vars
function validatePaymentInfo(_amount) {
  return; // dummy function that should be implemented later
}
async function purchase(req, res, next) {
  try {
    const { cid, paymentData } = req.params; // paymentData is not implemented yet
    checkOwnsCart(req, cid);
    const cart = await CartService.getCartById(cid);
    const user = await UserService.findByCart(cid);
    validatePaymentInfo(cart.total, user, paymentData); // doesn't do anything yet
    const { purchased, not_purchased } = await CartService.purchaseCart(cart);
    const ticket = await TicketService.addTicket({
      purchaser: user.email,
      amount: cart.total,
      purchase_datetime: new Date(),
    });
    sendSuccess(res, {
      ticket,
      purchased,
      not_purchased: not_purchased.length > 0 ? not_purchased : undefined,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getCarts,
  addCart,
  addProduct,
  getProducts,
  removeProduct,
  getCartById,
  clearCart,
  updateQuantity,
  updateQuantityMany,
  purchase,
};
