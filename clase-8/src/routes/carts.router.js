const express = require("express");
const router = express.Router();
const CartManager = require("../controllers/CartManager");
const ProductManager = require("../controllers/ProductManager");
const CARTSPATH = "src/models/carrito.json";

const pm = new ProductManager();
const cm = new CartManager(CARTSPATH, pm);

router.get("/", (req, res) => {
    res.send({status:"success", payload:cm.getCarts()});
})
router.get("/:cid", (req, res) => {
    const cid = parseInt(req.params.cid)
    if (!Number.isInteger(cid)){
        res.send({status:"error", message:`Invalid request: id must be an integer number`});
        return;
    }
    const cart = cm.getCartById(cid);
    if (cart == null){
        res.send({status:"error", message:`Error getting cart: ${cid} doesn't exist`});
        return;
    }
    res.send({status:"success", payload:cart});
})
router.post("/:cid/product/:pid", (req, res) => {
    let quantity = 1;
    req.query.quantity = parseInt(req.query.quantity);
    if (Number.isInteger(req.query.quantity)){
        quantity = req.query.quantity;
    }
    let result = cm.addProduct(req.params.cid, req.params.pid, quantity);
    if (result.errmsg == 0){
        res.send({status:"success", message:`Product id ${req.params.pid} added succesfully to cart id ${req.params.cid}`});
    } else{
        res.send({status:"error", message:`Error adding product: ${result.errmsg}`});
    }
})
router.post("/", (req,res) => {
    let cid = cm.addCart();
    res.send({status:"success", message:`Cart id ${cid} added succesfully`});
})

module.exports = router; 