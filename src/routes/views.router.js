const express = require("express");
const router = express.Router();
const ProductManager = require("../controllers/ProductManager");
const getMessages = require("../controllers/ChatManager").getMessages;
const pm = new ProductManager();


router.get("/realtimeproducts", async (req, res) => {
    res.render("realTimeProducts", {title:"Real time products"});
})
router.get("/", async (req, res) => {
    res.render("home", {title:"Home", products:await pm.getProducts()});
})
router.get("/chat", async (req, res) => {
    res.render("chat", {title:"Chat", messages:await getMessages()});
})
router.get("/cart", async (req, res) => {
    res.render("cart", {tile:"Cart"});
})

module.exports = router;