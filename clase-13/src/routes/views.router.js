const express = require("express");
const router = express.Router();
const ProductManager = require("../controllers/ProductManager");
const CartManager = require("../controllers/CartManager");
const getMessages = require("../controllers/ChatManager").getMessages;
const pm = new ProductManager();
const cm = new CartManager(pm);

function buildQueryString(queryObj, baseString = "", replace = {}) {
    result = baseString;
    queryObj = { ...queryObj, ...replace };
    for (let key of Object.keys(queryObj)) {
        if (queryObj[key] == null) {
            continue;
        }
        if (baseString == result) {
            result += `?${key}=${queryObj[key]}`;
            continue;
        }
        result += `&${key}=${queryObj[key]}`;
    }
    return result;
}
function adminAuth(req, res, next) {
    if (!req.session.loggedIn) {
        return res.redirect("/login");
    }
    if (req.session.user.role === "admin") {
        return next();
    }
    return res
        .status(403)
        .render("message", {
            error: true,
            message: "You're not authorized to be here",
        });
}
function auth(req, res, next) {
    if (req.session.loggedIn) {
        return next();
    }
    return res.redirect("/login");
}
router.get("/realtimeproducts", adminAuth, async (req, res) => {
    try {
        res.render("realTimeProducts", { title: "Real time products" });
    } catch (error) {
        res.status(500).json({ status: "error", message: "Internal server error" });
    }
});
router.get("/", auth, async (req, res) => {
    return res.redirect("products");
});
router.get("/profile", auth, async (req, res) => {
    res.render("profile", { user: req.session.user });
});
router.get("/logout", async (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.render("message", { error: true, message: err.message });
        }
        res.redirect("login");
    });
});
router.get("/register", async (req, res) => {
    let loggedIn = req.session.loggedIn ?? false;
    let errorMessage;
    let registerSuccess = req.session.registerSuccess;
    if (req.session.invalidRegister) {
        errorMessage = req.session.invalidRegister.message;
        req.session.invalidRegister = undefined;
    }
    req.session.registerSuccess = undefined;
    res.render("register", {
        loggedIn,
        username: req.session.username,
        errorMessage,
        registerSuccess,
    });
});
router.get("/login", async (req, res) => {
    let loggedIn = req.session.loggedIn ?? false;
    let errorMessage;
    let loginSuccess = req.session.loginSuccess;
    if (req.session.invalidLogin) {
        errorMessage = req.session.invalidLogin.message;
        req.session.invalidLogin = undefined;
    }
    req.session.loginSuccess = undefined;
    res.render("login", {
        loggedIn,
        username: req.session.username,
        errorMessage,
        loginSuccess,
    });
});
router.get("/products", async (req, res) => {
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
                res
                    .status(500)
                    .json({
                        status: "error",
                        message: `Error parsing query, make sure it's in JSON format`,
                    });
                return;
            }
        }
        let result = await pm.getProductsPaged({ limit, page, sort, query });
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
        const categories = await pm.getUniqueProperty("category");
        let loggedIn = req.session.loggedIn;
        let username = req.session.username;
        let role = req.session.user?.role;
        let cart = req.session.user?.cart;
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
        console.log(error);
        res.status(500).json({ status: "error", message: "Internal server error" });
    }
});
router.get("/chat", async (req, res) => {
    try {
        res.render("chat", { title: "Chat", messages: await getMessages() });
    } catch (error) {
        res.status(500).json({ status: "error", message: "Internal server error" });
    }
});
router.get("/cart", auth, async (req, res) => {
    let cartId = req.session.user.cart;
    res.redirect(`/carts/${cartId}`);
});
router.get("/carts", auth, async (req, res) => {
    if (req.session.user.role == "admin") {
        return res.render("message", {
            error: true,
            message: "No cart id specified",
        });
    }
    res.redirect("/cart");
});
router.get("/carts/:cid", auth, async (req, res) => {
    try {
        if (
            req.session.user.cart != req.params.cid &&
            req.session.user.role != "admin"
        ) {
            return res.render("message", {
                error: true,
                message: "You are not authorized to see other people's carts!",
            });
        }
        const result = await cm.getCartById(req.params.cid);
        if (result.errmsg !== 0) {
            res.render("cart", {
                title: "Cart",
                cartFound: false,
                cid: req.params.cid,
            });
            return;
        }
        const cart = result.cart;
        const products = cart.items.map((doc) => JSON.parse(JSON.stringify(doc)));
        const hasProducts = cart.items.length > 0;
        res.render("cart", {
            tile: "Cart",
            cartFound: true,
            cid: req.params.cid,
            hasProducts,
            products,
        });
    } catch (error) {
        res.status(500).json({ status: "error", message: "Internal server error" });
    }
});

module.exports = router;
