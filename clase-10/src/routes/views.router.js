const express = require("express");
const router = express.Router();
const ProductManager = require("../controllers/ProductManager");
const CartManager = require("../controllers/CartManager");
const UserManager = require("../controllers/UserManager");
const session = require("express-session");
const getMessages = require("../controllers/ChatManager").getMessages;
const pm = new ProductManager();
const cm = new CartManager(pm);
const um = new UserManager();
const validator = require("email-validator");

function buildQueryString(queryObj, baseString = "", replace={}){
    result = baseString;
    queryObj = {...queryObj, ...replace}
    for (let key of Object.keys(queryObj)){
        if (queryObj[key] == null){
            continue;
        }
        if (baseString == result){
            result += `?${key}=${queryObj[key]}`;
            continue;
        }
        result += `&${key}=${queryObj[key]}`;
    }
    return result;
}
function getUsername(email){
    let username = email.split("@")[0];
    username = username[0].toUpperCase() + username.substring(1);
    return username;
}
function adminAuth(req, res, next){
    if (req.session.user.role === "admin"){
        return next();
    }
    return res.status(403).render("message", {error:true, message:"You're not authorized to be here"});
}
router.get("/realtimeproducts", adminAuth, async (req, res) => {
    try {
        res.render("realTimeProducts", {title:"Real time products"});
    } catch (error) {
        res.status(500).json({status:"error", message:"Internal server error"});
        
    }
})
router.get("/", async (req, res) => {
    if (req.session.loggedIn){
        return res.redirect("products");
    }
    return res.redirect("login");
})
router.get("/profile", async (req, res) => {
    if (!req.session.loggedIn){
        return res.redirect("login");
    }
    res.render("profile", {user:req.session.user});
})
router.get("/logout", async (req, res) => {
    req.session.destroy( (err) => {
        if (err){
            return res.render("message", {error:true, message:err.message});
        }
        res.redirect("login");
    });
})
router.get("/register", async (req, res) => {
    let loggedIn = req.session.loggedIn ?? false;
    let errorMessage;
    let registerSuccess = req.session.registerSuccess;
    if (req.session.invalidRegister){
        errorMessage = req.session.invalidRegister.message;
        req.session.invalidRegister = undefined;
    }
    req.session.registerSuccess = undefined;
    res.render("register", {loggedIn, username:req.session.username, errorMessage, registerSuccess});
})
router.post("/register", async (req, res) => {
    console.log(req.body);
    let email = req.body.email?.trim().toLowerCase() ?? false;
    let age = Number(req.body.age);
    let first_name = req.body.first_name?.trim() ?? false;
    let last_name = req.body.last_name?.trim() ?? false;
    let password = req.body.password ?? false;
    if (age <= 0){
        req.session.invalidRegister = {message:"Invalid age"};
        return res.redirect("register");
    }
    if (!first_name){
        req.session.invalidRegister = {message:"First name is required"};
    }
    if (!last_name){
        req.session.invalidRegister = {message:"Last name is required"}
    }
    if (!password){
        req.session.invalidRegister = {message:"Password is required"};
        return res.redirect("register");
    }
    if (!validator.validate(email)){
        req.session.invalidRegister = {message:"Invalid email"}
        return res.redirect("register");
    }
    const result = await um.addUser({email, password, age, first_name, last_name});
    if (result.error){
        req.session.invalidRegister = {message:result.message};
        return res.redirect("register");
    }
    req.session.registerSuccess = true;
    res.redirect("register");
})
router.get("/login", async (req, res) => {
    let loggedIn = req.session.loggedIn ?? false;
    let errorMessage;
    let loginSuccess = req.session.loginSuccess;
    if (req.session.invalidLogin){
        errorMessage = req.session.invalidLogin.message;
        req.session.invalidLogin = undefined;
    }
    req.session.loginSuccess = undefined;
    res.render("login", {loggedIn, username:req.session.username, errorMessage, loginSuccess});
})
router.post("/login", async (req, res) => {
    let email = req.body.email?.trim().toLowerCase() ?? false;
    let password = req.body.password ?? false;
    if (!password){
        req.session.invalidLogin = {message:"Invalid password"};
        return res.redirect("login");
    }
    if (!validator.validate(email)){
        req.session.invalidLogin = {message:"Invalid email"}
        return res.redirect("login");
    }
    const result = await um.login(email, password);
    if (!result.result){
        req.session.invalidLogin = {message:result.message};
        return res.redirect("login");
    }
    req.session.loggedIn = true;
    req.session.loginSuccess = true;
    req.session.user = result.user;
    req.session.username = getUsername(result.user.email);
    let counter = Number(req.signedCookies.count);
    res.cookie("count", counter+1, {maxAge:86400000, signed:true}) // 86400000 ms = 24 hours
    req.session.save( (err) => {
        if (err){
            return res.render("message", {error:true, message:err.message});
        }
        res.redirect("login"); 
    } )
})
router.get("/products", async (req, res) => {
    try {
        let limit, page, sort, query;
        req.query.limit != undefined ? limit = Number(req.query.limit): limit = null;
        req.query.page != undefined ? page = Number(req.query.page): page = null;
        if (["asc", "desc"].includes(req.query.sort)){
            sort = req.query.sort;
        }
        if (req.query.query != null){
            try{
                query = JSON.parse(req.query.query);
            } catch (error){
                res.status(500).json({status:"error", message:`Error parsing query, make sure it's in JSON format`});
                return;
            }
        }
        let result = await pm.getProductsPaged({limit, page, sort, query});
        if (result.error){
            res.status(500).json({status:"error", message:result.message});
            return;
        }
        result.docs = result.docs.map(doc => JSON.parse(JSON.stringify(doc)));
        ({totalPages, prevPage, nextPage, hasPrevPage, hasNextPage, page, prevLink, nextLink, firstLink, lastLink} = result);
        if (hasPrevPage){
            prevLink = buildQueryString(req.query, '', {page:result.page-1});
            firstLink = buildQueryString(req.query, '', {page:1});
        }
        if (hasNextPage){
            nextLink = buildQueryString(req.query, '', {page:result.page+1});
            lastLink = buildQueryString(req.query, '', {page:result.totalPages});
        }
        const categories = await pm.getUniqueProperty("category");
        let loggedIn = req.session.loggedIn;
        let username = req.session.username;
        let role = req.session.user?.role;
        let invalidPage = (page > totalPages || !Number.isInteger(page));
        res.render("home", {invalidPage, title:"Home", loggedIn, username, role, products:result.docs, page, totalPages, prevPage, nextPage, hasPrevPage, hasNextPage, prevLink, nextLink, firstLink, lastLink, categories});
    } catch (error) {
        console.log(error);
        res.status(500).json({status:"error", message:"Internal server error"});
    }
})
router.get("/chat", async (req, res) => {
    try {
        res.render("chat", {title:"Chat", messages:await getMessages()});
    } catch (error) {
        res.status(500).json({status:"error", message:"Internal server error"});
        
    }
})
router.get("/carts", async (req, res) => {
    res.render("message", {message:"You didn't specify the cart id in the url. There's nothing here.", p:"Try /carts/65fe45c44fa17fb49a863d0a"});
})
router.get("/carts/:cid", async (req, res) => {
    try {
        const result = await cm.getCartById(req.params.cid);
        if (result.errmsg !== 0){
            res.render("cart", {title:"Cart", cartFound:false, cid:req.params.cid});
            return;
        }
        const cart = result.cart;
        const products = cart.items.map(doc => JSON.parse(JSON.stringify(doc)));
        const hasProducts = cart.items.length > 0;
        res.render("cart", {tile:"Cart", cartFound:true, cid:req.params.cid, hasProducts, products});
    } catch (error) {
        res.status(500).json({status:"error", message:"Internal server error"});
        
    }
})

module.exports = router;