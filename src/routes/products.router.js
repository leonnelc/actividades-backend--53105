const express = require("express");
const router = express.Router();
const PRODUCTSPATH = "src/models/products.json"
const ProductManager = require("../controllers/ProductManager")

const pm = new ProductManager(PRODUCTSPATH);

router.get("/", (req, res) => {
    let limit = req.query.limit;
    let products = pm.getProducts();
    if (limit == null){
        res.send({status:"success", payload:products});
    }else{
        res.send({status:"success", payload:products.slice(0, limit)});  
    }
})
router.get("/:pid", (req, res) => {
    let product = pm.getProductById(req.params.pid);
    if (product == null){
        res.send({status:"error", message:`Product id "${req.params.pid}" not found`});
    }else{
        res.send({status:"success", payload:product});
    }
})

router.post("/", (req, res, next) => {
    let result = pm.addProduct(req.body);
    if (result.errmsg === 0){
        //res.send({status:"success", message:`Product added succesfully with id ${result.id}`});
        res.locals.send = {status:"success", message:`Product added succesfully with id ${result.id}`};
        res.locals.products = pm.getProducts();
        next();
        return;
    } else{
        res.send({status:"error", message:`Couldn't add product: ${result.errmsg}`});
    }
})

router.delete("/:pid", (req, res, next) => {
    let result = pm.deleteProduct(req.params.pid);
    if (result.errmsg === 0){
        //res.send({status:"success", message: "Product deleted succesfully"});
        res.locals.send = {status:"success", message: "Product deleted succesfully"};
        res.locals.products = pm.getProducts();
        next();
        return;
    } else{
        res.send({status:"error", message:`Couldn't delete product: ${result.errmsg}`});
    }
})

router.put("/:pid", (req, res, next) => {
    let result = pm.updateProduct(req.params.pid, req.body);
    if (result.errmsg === 0){
        //res.send({status:"success", message: "Product succesfully updated"});
        res.locals.send = {status:"success", message: "Product succesfully updated"};
        res.locals.products = pm.getProducts();
        next();
        return;
    } else{
        res.send({status:"error", message:`Couldn't update product: ${result.errmsg}`});
    }
})

module.exports = router; 