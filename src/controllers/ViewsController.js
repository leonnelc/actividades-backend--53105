const CartService = require("../services/CartService");
const ProductService = require("../services/ProductService");
const ChatService = require("../services/ChatService");
const UserService = require("../services/UserService");
const UserDTO = require("../dtos/UserDTO");
const PaginatedProductDTO = require("../dtos/PaginatedProductDTO");
const { buildQueryString } = require("./ControllerUtils");
const ViewsError = require("../services/errors/ViewError");
const jwt = require("jsonwebtoken");
const { logger } = require("../utils/logger");
const { JWT_SECRET } = require("../config/config");

const renderError = (next, error) => {
  error.isView = true;
  next(error);
};

async function realTimeProducts(req, res, next) {
  try {
    res.render("realTimeProducts", {
      title: "Real time products",
      user: req.user,
    });
  } catch (error) {
    renderError(next, error);
  }
}
async function login(req, res, next) {
  try {
    const user = req.user;
    res.render("login", { title: "Login", user });
  } catch (error) {
    renderError(next, error);
  }
}

async function loginCallback(req, res, next) {
  try {
    const { provider } = req.params;
    const user = req.user;
    res.render("login", { title: "Login", user, provider });
  } catch (error) {
    renderError(next, error);
  }
}

async function register(req, res, next) {
  try {
    const user = req.user;
    const { err } = req.query;
    res.render("register", {
      title: "Register",
      user,
      registerSuccess: null,
    });
  } catch (error) {
    renderError(next, error);
  }
}
async function products(req, res, next) {
  try {
    const result = await ProductService.getProductsPaginated(req.query);
    const categories = await ProductService.getCategories();
    const url = req.baseUrl + req.path;
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
    const resultDTO = new PaginatedProductDTO(result);
    const user = req.user;
    res.render("home", {
      title: "Products",
      user,
      result: resultDTO,
      products: result.docs,
      categories,
    });
  } catch (error) {
    renderError(next, error);
  }
}
async function carts(req, res, next) {
  try {
    let cid = req.params?.cid ?? req.user?.cart;
    if (req.user.cart != cid && req.user.role != "admin") {
      return res.render("message", {
        title: "Error",
        user: req.user,
        error: true,
        message: "You are not authorized to see other people's carts!",
      });
    }
    if (!cid) {
      throw new ViewsError("Cart not assigned, contact an administrator");
    }
    const cart = await CartService.getCartById(cid);
    const products = [];
    cart.items.forEach((product) => {
      products.push(JSON.parse(JSON.stringify(product)));
    });
    const hasProducts = products.length > 0;
    res.render("cart", {
      tile: "Cart",
      user: req.user,
      cartFound: true,
      cid,
      hasProducts,
      products,
    });
  } catch (error) {
    renderError(next, error);
  }
}
async function chat(req, res, next) {
  try {
    res.render("chat", {
      title: "Chat",
      user: req.user,
      messages: await ChatService.getMessages(),
    });
  } catch (error) {
    renderError(next, error);
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
    await req.refreshAccessToken(fullUser);
    res.render("profile", {
      user,
    });
  } catch (error) {
    renderError(next, error);
  }
}
async function logout(req, res) {
  res.clearCookie("accessToken");
  res.clearCookie("refreshToken");
  res.redirect("/login");
}
async function resetPassword(req, res) {
  const { token } = req.query;
  try {
    if (token) jwt.verify(token, JWT_SECRET);
    res.render("resetpassword", { title: "Password reset", user: req.user });
  } catch (error) {
    logger.warning(error);
    res.render("resetpassword", {
      title: "Password reset",
      user: req.user,
      invalidtoken: true,
    });
  }
}

async function userDashboard(req, res) {
  res.render("userDashboard", { title: "User dashboard", user: req.user });
}
module.exports = {
  realTimeProducts,
  login,
  loginCallback,
  register,
  products,
  carts,
  chat,
  profile,
  logout,
  resetPassword,
  userDashboard,
};
