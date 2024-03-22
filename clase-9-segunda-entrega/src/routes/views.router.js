const express = require("express");
const router = express.Router();
const ProductManager = require("../controllers/ProductManager");
const getMessages = require("../controllers/ChatManager").getMessages;
const pm = new ProductManager();


router.get("/realtimeproducts", async (req, res) => {
    try {
        res.render("realTimeProducts", {title:"Real time products"});
    } catch (error) {
        res.status(500).send({status:"error", message:"Internal server error"})
        
    }
})
router.get("/", async (req, res) => {
    try {
        res.render("home", {title:"Home", products:await pm.getProducts()});
    } catch (error) {
        res.status(500).send({status:"error", message:"Internal server error"})
    }
})
router.get("/chat", async (req, res) => {
    try {
        res.render("chat", {title:"Chat", messages:await getMessages()});
    } catch (error) {
        res.status(500).send({status:"error", message:"Internal server error"})
        
    }
})
router.get("/cart", async (req, res) => {
    try {
        res.render("cart", {tile:"Cart"});
    } catch (error) {
        res.status(500).send({status:"error", message:"Internal server error"})
        
    }
})

module.exports = router;