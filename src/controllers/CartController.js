const CartService = require("../services/CartService");
const TicketService = require("../services/TicketService");
const UserService = require("../services/UserService");
const ProductService = require("../services/ProductService");
const { sendSuccess, buildQueryString } = require("./ControllerUtils");
const CartError = require("../services/errors/api/CartError");
const APIError = require("../services/errors/APIError");
const CartDTO = require("../dtos/CartDTO");
const PaginatedCartDTO = require("../dtos/PaginatedCartDTO");
const TicketDTO = require("../dtos/TicketDTO");
function checkOwnsCartOrIsAdmin(req, cid) {
  const user = req.user;
  if (user.cart == cid || user.role == "admin") {
    return;
  }
  throw new APIError(`Not authorized to access cart ${cid}`, {
    name: "NotAuthorized",
  });
}
function checkOwnsCart(req, cid) {
  const user = req.user;
  if (user.cart != cid) {
    throw new APIError(`User doesn't own cart ${cid}`, {
      name: "NotAuthorized",
    });
  }
}

async function addCart(req, res, next) {
  try {
    const owner = req.query.owner;
    if (owner && !(await UserService.userExists(owner))) {
      throw new CartError(`Owner ${owner} not found`, {
        name: "NotFound",
      });
    }
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
      throw new CartError("Can't add own product to cart");
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

async function addProducts(req, res, next) {
  try {
    const { cid } = req.params;
    checkOwnsCartOrIsAdmin(req, cid);
    sendSuccess(res, {
      message: "Products added succesfuly",
      cart: await CartService.addProducts(cid, req.body),
    });
  } catch (error) {
    console.log(error);
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
    sendSuccess(res, { message: "Cart cleared succesfully" });
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
      await CartService.updateQuantity(cid, pid, quantity),
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
        "Request body must be an array containing objects in the format {product:productId, quantity:Number}",
      );
    }
    const cart = new CartDTO(
      await CartService.updateQuantityMany(cid, req.body),
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
      ticket: new TicketDTO(ticket),
      purchased,
      not_purchased: not_purchased.length > 0 ? not_purchased : undefined,
    });
  } catch (error) {
    next(error);
  }
}

async function getCartsPaginated(req, res, next) {
  try {
    const url = req.baseUrl + req.path;
    const result = await CartService.getCartsPaginated(req.query);
    result.prevLink = !result.prevPage
      ? null
      : buildQueryString(req.query, `${url}`, {
          page: result.prevPage,
        });
    result.nextLink = !result.nextPage
      ? null
      : buildQueryString(req.query, `${url}`, {
          page: result.nextPage,
        });
    sendSuccess(res, new PaginatedCartDTO(result));
  } catch (error) {
    next(error);
  }
}

module.exports = {
  addCart,
  addProduct,
  addProducts,
  getProducts,
  removeProduct,
  getCartById,
  clearCart,
  updateQuantity,
  updateQuantityMany,
  purchase,
  getCartsPaginated,
};
