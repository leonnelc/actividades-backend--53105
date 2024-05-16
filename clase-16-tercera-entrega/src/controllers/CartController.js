const CartService = require("../services/CartService");
const { sendError, sendSuccess } = require("./ControllerUtils");
const CartDTO = require("../dtos/CartDTO");
function validateCartOwner(req, cid) {
  const user = req.session.user;
  if (user.cart == cid || user.role == "admin") {
    return;
  }
  throw new Error("Not authorized to access this cart");
}

async function getCarts(req, res) {
  try {
    const carts = (await CartService.getCarts()).map(
      (cart) => new CartDTO(cart)
    );
    sendSuccess(res, { carts });
  } catch (error) {
    sendError(res, error);
  }
}
async function addCart(req, res) {
  try {
    const owner = req.query.owner;
    const cart = new CartDTO(await CartService.addCart(owner));
    sendSuccess(res, { cart });
  } catch (error) {
    sendError(res, error);
  }
}
async function addProduct(req, res) {
  try {
    const { cid, pid } = req.params;
    validateCartOwner(req, cid);
    let quantity = parseInt(req.query.quantity);
    if (!req.query.quantity) {
      quantity = 1;
    }
    if (!Number.isInteger(quantity) || quantity <= 0) {
      throw new Error("Invalid quantity query, must be a positive integer");
    }
    const cart = new CartDTO(await CartService.addProduct(cid, pid, quantity));
    sendSuccess(res, { cart });
  } catch (error) {
    sendError(res, error);
  }
}
async function getCartById(req, res) {
  try {
    const { cid } = req.params;
    validateCartOwner(req, cid);
    const cart = new CartDTO(await CartService.getCartById(cid));
    sendSuccess(res, { cart });
  } catch (error) {
    sendError(res, error);
  }
}
async function clearCart(req, res) {
  try {
    const { cid } = req.params;
    validateCartOwner(req, cid);
    await CartService.clearCart(cid);
    sendSuccess(res, {});
  } catch (error) {
    sendError(res, error);
  }
}
async function removeProduct(req, res) {
  try {
    const { cid, pid } = req.params;
    validateCartOwner(req, cid);
    const cart = new CartDTO(await CartService.removeProduct(cid, pid));
    sendSuccess(res, { cart });
  } catch (error) {
    sendError(res, error);
  }
}
async function updateQuantity(req, res) {
  try {
    const { cid, pid } = req.params;
    validateCartOwner(req, cid);
    const quantity = parseInt(req.body.quantity);
    if (!Number.isInteger(quantity)) {
      throw new Error("Quantity not specified or isn't an integer");
    }
    const cart = new CartDTO(
      await CartService.updateQuantity(cid, pid, quantity)
    );
    sendSuccess(res, { cart });
  } catch (error) {
    sendError(res, error);
  }
}
async function updateQuantityMany(req, res) {
  try {
    const { cid } = req.params;
    validateCartOwner(req, cid);
    if (!Array.isArray(req.body)) {
      throw new Error(
        "Request body must be an array containing objects in the format {product:productId, quantity:Number}"
      );
    }
    const cart = new CartDTO(
      await CartService.updateQuantityMany(cid, req.body)
    );
    sendSuccess(res, { cart });
  } catch (error) {
    sendError(res, error);
  }
}
async function getProducts(req, res) {
  try {
    const { cid } = req.params;
    validateCartOwner(req, cid);
    const products = new CartDTO(await CartService.getCartById(cid)).products;
    sendSuccess(res, { products });
  } catch (error) {
    sendError(res, error);
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
};
