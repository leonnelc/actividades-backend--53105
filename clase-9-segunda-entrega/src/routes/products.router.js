const express = require("express");
const router = express.Router();
const ProductManager = require("../controllers/ProductManager")

const pm = new ProductManager();

router.get("/", async (req, res) => {
    let limit;
    let page;
    let sort;
    let query;
    if (!isNaN(req.query.limit)){
        limit = parseInt(req.query.limit);
    }
    if (!isNaN(req.query.page)){
        page = parseInt(req.query.page);
    }
    if (["asc", "desc"].includes(req.query.sort)){
        sort = req.query.sort;
    }
    if (req.query.query != null){
        query = req.query.query;
    }
    let result = await pm.getProducts({limit, page, sort, query});
    if (result.errmsg == 0){
        let products = result.products;
        res.send({status:"success", payload:products, totalPages, prevPage, nextPage, page, hasPrevPage, hasNextPage, prevLink, nextLink});
        return;
    }
    res.send({status:"error", message:result.errmsg});
})
router.get("/:pid", async (req, res) => {
    let product = await pm.getProductById(req.params.pid);
    if (product == null){
        res.send({status:"error", message:`Product id "${req.params.pid}" not found`});
    }else{
        res.send({status:"success", payload:product});
    }
})
router.get("/code/:code", async (req, res) => {
    let product = await pm.getProductByCode(req.params.code);
    if (product == null){
        res.send({status:"error", message:`Product code "${req.params.code} not found`});
    }
    else{
        res.send({status:"success", payload:product});
    }
})

router.post("/", async (req, res, next) => {
    let result = await pm.addProduct(req.body);
    if (result.errmsg === 0){
        //res.send({status:"success", message:`Product added succesfully with id ${result.id}`});
        res.locals.send = {status:"success", message:`Product added succesfully with id ${result.id}`};
        res.locals.products = await pm.getProducts();
        next();
        return;
    } else{
        res.send({status:"error", message:`Couldn't add product: ${result.errmsg}`});
    }
})

router.delete("/:pid", async (req, res, next) => {
    let result = await pm.deleteProduct(req.params.pid);
    if (result.errmsg === 0){
        //res.send({status:"success", message: "Product deleted succesfully"});
        res.locals.send = {status:"success", message: "Product deleted succesfully"};
        res.locals.products = await pm.getProducts();
        next();
        return;
    } else{
        res.send({status:"error", message:`Couldn't delete product: ${result.errmsg}`});
    }
})

router.put("/:pid", async (req, res, next) => {
    let result = await pm.updateProduct(req.params.pid, req.body);
    if (result.errmsg === 0){
        //res.send({status:"success", message: "Product succesfully updated"});
        res.locals.send = {status:"success", message: "Product succesfully updated"};
        res.locals.products = await pm.getProducts();
        next();
        return;
    } else{
        res.send({status:"error", message:`Couldn't update product: ${result.errmsg}`});
    }
})

module.exports = router; 