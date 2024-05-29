const express = require("express");
const router = express.Router();
const CartManager = require("../controllers/CartManager");
const ProductManager = require("../controllers/ProductManager");

const pm = new ProductManager();
const cm = new CartManager(pm);

router.get("/", async (req, res) => {
    res.send(await cm.getCarts());
})
router.get("/:cid", async (req, res) => {
    const result = await cm.getCartById(req.params.cid);
    if (result.errmsg === 0){
        res.send(result.cart);
        return;
    }
    res.status(400).send(`Error getting cart: ${result.errmsg}`);
})
router.get("/:cid/product", async (req, res) => {
    const result = await cm.getCartProducts(req.params.cid);
    if (result.errmsg === 0){
        res.status(200).send(result.products);
        return;
    }
    res.status(400).send(result.errmsg);
})
router.post("/:cid/product/:pid", async (req, res) => {
    let quantity = 1;
    req.query.quantity = parseInt(req.query.quantity);
    if (Number.isInteger(req.query.quantity)){
        quantity = req.query.quantity;
    }
    let result = await cm.addProduct(req.params.cid, req.params.pid, quantity);
    if (result.errmsg === 0){
        res.send({status:"success", message:`Product id ${req.params.pid} added succesfully to cart id ${req.params.cid}`});
    } else{
        res.send({status:"error", message:`Error adding product: ${result.errmsg}`});
    }
})
router.post("/", async (req, res) => {
    let cid = await cm.addCart();
    if (cid != null){
        res.send({status:"success", message:`Cart id ${cid} added succesfully`});
    } else{
        res.send({status:"error", message:"Couldn't add cart"});
    }
})
router.delete("/:cid", async (req, res) => {
    const cart = await cm.deleteCart(req.params.cid);
    if (cart != null){
        res.send({status:"success", message:`Cart with id ${cart} deleted succesfully`});
    } else{
        res.send({status:"error", message:`Cart with id ${req.params.cid} doesn't exist`});
    }
})
router.delete("/:cid/product/:pid", async (req, res) => {
    let quantity = null;
    req.query.quantity = parseInt(req.query.quantity);
    if (Number.isInteger(req.query.quantity)){
        quantity = req.query.quantity;
    }
    let result = await cm.removeProduct(req.params.cid, req.params.pid, quantity);
    if (result.errmsg === 0){
        if (quantity == null){
            res.status(200).send(`Product id ${req.params.pid} deleted succesfully from cart id ${req.params.cid}`);
        } else{
            res.status(200).send(`Product id ${req.params.pid} deleted succesfully ${quantity} times from cart id ${req.params.cid}`);
        }
    } else{
        res.status(400).send(`Error removing product: ${result.errmsg}`);
    }
})

module.exports = router; 