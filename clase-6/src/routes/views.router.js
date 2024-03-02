const express = require("express");
const router = express.Router();
const ProductManager = require("../controllers/ProductManager");
const pm = new ProductManager();


router.get("/realtimeproducts", (req, res) => {
    res.render("realTimeProducts", {title:"Real time products"});
})
router.get("/", (req, res) => {
    res.render("home", {title:"Home", products:pm.getProducts()});
})

module.exports = router;