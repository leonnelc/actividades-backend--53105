const CartService = require("../services/CartService");
const { sendError, sendSuccess } = require("./ControllerUtils");
function validateCartOwner(req, cid) {
  const user = req.session.user;
  if (user.cart == cid || user.role == "admin") {
    return;
  }
  throw new Error("Not authorized to access this cart");
}

async function getCarts(req, res) {
  try {
    sendSuccess(res, { carts: await CartService.getCarts() });
  } catch (error) {
    sendError(res, error);
  }
}
async function addCart(req, res) {
  try {
    const owner = req.query.owner;
    sendSuccess(res, { cid: await CartService.addCart(owner) });
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
    sendSuccess(res, {
      new_quantity: await CartService.addProduct(cid, pid, quantity),
    });
  } catch (error) {
    sendError(res, error);
  }
}
async function getCartById(req, res) {
  try {
    const { cid } = req.params;
    validateCartOwner(req, cid);
    sendSuccess(res, { cart: await CartService.getCartById(cid) });
  } catch (error) {
    sendError(res, error);
  }
}
async function clearCart(req, res) {
  try {
    const { cid } = req.params;
    validateCartOwner(req, cid);
    await CartService.clearCart(cid);
    sendSuccess(res, { message: "Cart cleared" });
  } catch (error) {
    sendError(res, error);
  }
}
async function removeProduct(req, res) {
  try {
    const { cid, pid } = req.params;
    validateCartOwner(req, cid);
    await CartService.removeProduct(cid, pid);
    sendSuccess(res, { message: "Product removed succesfully" });
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
    await CartService.updateQuantity(cid, pid, quantity);
    sendSuccess(res, { message: "Quantity updated succesfully" });
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
    await CartService.updateQuantityMany(cid, req.body);
    sendSuccess(res, { message: "Products updated succesfully" });
  } catch (error) {
    sendError(res, error);
  }
}
async function getProducts(req, res) {
  try {
    const { cid } = req.params;
    validateCartOwner(req, cid);
    sendSuccess(res, await CartService.getProducts(cid));
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
