const CartService = require("../services/CartService");
const ProductService = require("../services/ProductService");
const ChatService = require("../services/ChatService");
const {
  sendError,
  sendSuccess,
  buildQueryString,
} = require("./ControllerUtils");

async function realTimeProducts(req, res) {
  try {
    res.render("realTimeProducts", { title: "Real time products" });
  } catch (error) {
    sendError(res, error);
  }
}
async function login(req, res) {
  const { loggedIn, loginSuccess, user } = req.session;
  const errorMessage = req.session?.invalidLogin?.message;
  req.session.loginSuccess = undefined;
  req.session.invalidLogin = undefined;
  res.render("login", {
    loggedIn,
    username: user?.first_name,
    errorMessage,
    loginSuccess,
  });
}
async function register(req, res) {
  const { loggedIn, registerSuccess, user } = req.session;
  const errorMessage = req.session?.invalidRegister?.message;
  req.session.invalidRegister = undefined;
  req.session.registerSuccess = undefined;
  res.render("register", {
    loggedIn,
    username: user?.first_name,
    errorMessage,
    registerSuccess,
  });
}
async function products(req, res) {
  try {
    let limit, page, sort, query;
    req.query.limit != undefined
      ? (limit = Number(req.query.limit))
      : (limit = null);
    req.query.page != undefined
      ? (page = Number(req.query.page))
      : (page = null);
    if (["asc", "desc"].includes(req.query.sort)) {
      sort = req.query.sort;
    }
    if (req.query.query != null) {
      try {
        query = JSON.parse(req.query.query);
      } catch (error) {
        return sendError(
          res,
          new Error(`Error parsing query, make sure it's in JSON format`),
          500
        );
      }
    }
    let result = await ProductService.getProductsPaged({
      limit,
      page,
      sort,
      query,
    });
    if (result.error) {
      res.status(500).json({ status: "error", message: result.message });
      return;
    }
    result.docs = result.docs.map((doc) => JSON.parse(JSON.stringify(doc)));
    ({
      totalPages,
      prevPage,
      nextPage,
      hasPrevPage,
      hasNextPage,
      page,
      prevLink,
      nextLink,
      firstLink,
      lastLink,
    } = result);
    if (hasPrevPage) {
      prevLink = buildQueryString(req.query, "", { page: result.page - 1 });
      firstLink = buildQueryString(req.query, "", { page: 1 });
    }
    if (hasNextPage) {
      nextLink = buildQueryString(req.query, "", { page: result.page + 1 });
      lastLink = buildQueryString(req.query, "", { page: result.totalPages });
    }
    const categories = await ProductService.getCategories();
    const { loggedIn, user } = req.session;
    const username = user?.first_name;
    const role = user?.role;
    const cart = user?.cart;
    let invalidPage = page > totalPages || !Number.isInteger(page);
    res.render("home", {
      invalidPage,
      title: "Home",
      loggedIn,
      username,
      role,
      cart,
      products: result.docs,
      page,
      totalPages,
      prevPage,
      nextPage,
      hasPrevPage,
      hasNextPage,
      prevLink,
      nextLink,
      firstLink,
      lastLink,
      categories,
    });
  } catch (error) {
    sendError(res, error);
  }
}
async function carts(req, res) {
  try {
    let cid = req.params?.cid ?? req.session?.user?.cart;
    if (req.session.user.cart != cid && req.session.user.role != "admin") {
      return res.render("message", {
        error: true,
        message: "You are not authorized to see other people's carts!",
      });
    }
    if (!cid) {
      throw new Error(`No valid cart specified`);
    }
    const cart = await CartService.getCartById(cid);
    const products = [];
    cart.items.forEach((product) => {
      products.push(JSON.parse(JSON.stringify(product)));
    });
    const hasProducts = products.length > 0;
    res.render("cart", {
      tile: "Cart",
      cartFound: true,
      cid,
      hasProducts,
      products,
    });
  } catch (error) {
    sendError(res, error, 404);
  }
}
async function chat(req, res) {
  try {
    res.render("chat", {
      title: "Chat",
      messages: await ChatService.getMessages(),
    });
  } catch (error) {
    sendError(res, error);
  }
}
async function profile(req, res) {
  res.render("profile", { user: req.session.user });
}
async function logout(req, res) {
  req.session.destroy((err) => {
    if (err) {
      return res.render("message", { error: true, message: err.message });
    }
    res.redirect("login");
  });
}
module.exports = {
  realTimeProducts,
  login,
  register,
  products,
  carts,
  chat,
  profile,
  logout,
};
