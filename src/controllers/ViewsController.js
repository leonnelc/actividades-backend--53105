const CartService = require("../services/CartService");
const ProductService = require("../services/ProductService");
const ChatService = require("../services/ChatService");
const UserService = require("../services/UserService");
const UserDTO = require("../dtos/UserDTO");
const { buildQueryString } = require("./ControllerUtils");
const ViewsError = require("../services/errors/ViewError");
const jwt = require("jsonwebtoken");
const { logger } = require("../utils/logger");
const { JWT_SECRET } = require("../config/config");

async function realTimeProducts(req, res, next) {
  try {
    res.render("realTimeProducts", { title: "Real time products" });
  } catch (error) {
    next(new ViewsError(error.message));
  }
}
async function login(req, res, next) {
  try {
    const user = req.user;
    const { err } = req.query;
    res.render("login", {
      username: user?.first_name,
      errorMessage: err,
      loginSuccess: undefined,
    });
  } catch (error) {
    next(new ViewsError(error.message));
  }
}
async function register(req, res, next) {
  try {
    const user = req.user;
    const { err } = req.query;
    res.render("register", {
      username: user?.first_name,
      errorMessage: err,
      registerSuccess: null,
    });
  } catch (error) {
    next(new ViewsError(error.message));
  }
}
async function products(req, res, next) {
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
        next(
          new ViewsError(`Error parsing query, make sure it's in JSON format`),
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
    const user = req.user;
    const username = user?.first_name;
    const role = user?.role;
    const cart = user?.cart;
    let invalidPage = page > totalPages || !Number.isInteger(page);
    res.render("home", {
      invalidPage,
      title: "Home",
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
    next(new ViewsError(error.message));
  }
}
async function carts(req, res, next) {
  try {
    let cid = req.params?.cid ?? req.user?.cart;
    if (req.user.cart != cid && req.user.role != "admin") {
      return res.render("message", {
        error: true,
        message: "You are not authorized to see other people's carts!",
      });
    }
    if (!cid) {
      if (req.user.role !== "admin") {
        throw new Error("Cart not assigned, contact an administrator");
      }
      const carts = [];
      for (let cart of await CartService.getCarts()) {
        carts.push({ ...cart._doc });
      }
      return res.render("cartSelector", { carts });
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
    next(new ViewsError(error.message));
  }
}
async function chat(req, res, next) {
  try {
    res.render("chat", {
      title: "Chat",
      messages: await ChatService.getMessages(),
    });
  } catch (error) {
    next(new ViewsError(error.message));
  }
}
async function profile(req, res, next) {
  try {
    const fullUser = await UserService.findById(req.user.id);
    const documents = {};
    for (let doc of fullUser.documents) {
      documents[doc.name] = doc.reference;
    }
    fullUser._doc.documents = documents;
    const user = { ...fullUser._doc, ...new UserDTO(fullUser) };
    res.render("profile", {
      user,
      helpers: {
        firstChar: (str) => (str ? str.charAt(0).toUpperCase() : ""),
        eq: (a, b) => a === b,
      },
    });
  } catch (error) {
    next(new ViewsError(error.message));
  }
}
async function logout(req, res, next) {
  res.clearCookie("jwt");
  res.redirect("login");
}
async function resetPassword(req, res, next) {
  const { token } = req.query;
  try {
    if (token) jwt.verify(token, JWT_SECRET);
    res.render("resetpassword");
  } catch (error) {
    logger.warning(error);
    res.render("resetpassword", { invalidtoken: true });
  }
}

async function userDashboard(req, res, next) {
  res.render("userDashboard");
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
  resetPassword,
  userDashboard,
};
