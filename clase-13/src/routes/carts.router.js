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
    if (result.errmsg != 0){
        res.status(400).send(`Error getting cart: ${result.errmsg}`);
        return;
    }
    res.send(result.cart);
})
router.get("/:cid/products", async (req, res) => {
    const result = await cm.getCartProducts(req.params.cid);
    if (result.errmsg != 0){
        res.status(400).send(result.errmsg);
        return;
    }
    res.status(200).send(result.products);
})
router.post("/:cid/products/:pid", async (req, res) => {
    let quantity = 1;
    req.query.quantity = parseInt(req.query.quantity);
    if (Number.isInteger(req.query.quantity)){
        quantity = req.query.quantity;
    }
    let result = await cm.addProduct(req.params.cid, req.params.pid, quantity);
    if (result.errmsg != 0){
        res.send({status:"error", message:`Error adding product: ${result.errmsg}`});
        return;
    }
    res.send({status:"success", message:`Product id ${req.params.pid} added succesfully to cart id ${req.params.cid}`});
})
router.post("/", async (req, res) => {
    let cid = await cm.addCart();
    if (cid == null){
        res.send({status:"error", message:"Couldn't add cart"});
        return;
    }
    res.send({status:"success", message:`Cart id ${cid} added succesfully`});
})
router.delete("/:cid", async (req, res) => {
    const result = await cm.emptyCart(req.params.cid);
    if (result.error){
        res.json({status:"error", message:result.message});
        return;
    }
    res.json({status:"success", message:"Cart emptied succesfully"});
    /*
    This deletes the cart instead of emptying it
    const cart = await cm.deleteCart(req.params.cid);
    if (cart != null){
        res.send({status:"error", message:`Cart with id ${req.params.cid} doesn't exist`});
        return;
    }
    res.send({status:"success", message:`Cart with id ${cart} deleted succesfully`});
    */
})
router.delete("/:cid/products/:pid", async (req, res) => {
    let quantity = null;
    req.query.quantity = parseInt(req.query.quantity);
    if (Number.isInteger(req.query.quantity)){
        quantity = req.query.quantity;
    }
    let result = await cm.removeProduct(req.params.cid, req.params.pid, quantity);
    if (result.errmsg != 0){
        return res.status(400).json({status:"error", message:`Error removing product: ${result.errmsg}`});
    }
    if (quantity == null){
        res.status(200).json({status:"success", message:`Product id ${req.params.pid} deleted succesfully from cart id ${req.params.cid}`});
    } else{
        res.status(200).json({status:"success", message:`Product id ${req.params.pid} deleted succesfully ${quantity} times from cart id ${req.params.cid}`});
    }
    
})
router.put("/:cid", async (req, res) => {
    try {
        if (!Array.isArray(req.body)){
            throw new Error("Request body must be an array containing objects in the format {product:productId, quantity:Number}");
        }
        const result = await cm.updateQuantityMany(req.params.cid, req.body);
        if (result.error){
            throw new Error(result.message);
        }
        res.json({status:"success", message:"Products updated succesfully"});
    } catch (error) {
        res.status(500).json({status:"error", message:error.message});
    }
})
router.put("/:cid/products/:pid", async (req, res) => {
    try {
        const quantity = Number(req.body.quantity);
        if (!Number.isInteger(quantity)){
            res.status(500).json({status:"error", message:"Quantity not specified or isn't an integer"});
            return;
        }
        const result = await cm.updateQuantity(req.params.cid, req.params.pid, quantity);
        if (result.error){
            res.status(500).json({status:"error", message:result.message});
            return;
        }
        res.json({status:"success", message:"Product quantity updated succesfully"});
    } catch (error) {
        res.status(500).json({status:"error", message:error.message});
    }
})

module.exports = router; 