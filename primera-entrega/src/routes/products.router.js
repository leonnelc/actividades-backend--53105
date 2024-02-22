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

router.post("/", (req, res) => {
    let result = pm.addProduct(req.body);
    if (result.errmsg === 0){
        res.send({status:"success", message:`Product added succesfully with id ${result.id}`});
    } else{
        res.send({status:"error", message:`Couldn't add product: ${result.errmsg}`});
    }
})

router.delete("/", (req, res) => {
    if (!Object.keys(req.body).includes("id")){
        res.send({status:"error", message:"Invalid request, id must be in JSON format"});
        return;
    }
    let result = pm.deleteProduct(req.body.id);
    if (result.errmsg === 0){
        res.send({status:"success", message: "Product deleted succesfully"});
    } else{
        res.send({status:"error", message:`Couldn't delete product: ${result.errmsg}`});
    }
})

router.put("/", (req, res) => {
    if (!Object.keys(req.body).includes("id")){
        res.send({status:"error", message:"Invalid request, id and properties must be in JSON format"});
        /* Example request: {
            id: 0,
            title: "New title"
            description: "New description"
        }
        */
        return;
    }
    let result = pm.updateProduct(req.body.id, req.body);
    if (result.errmsg === 0){
        res.send({status:"success", message: "Product succesfully updated"});
    } else{
        res.send({status:"error", message:`Couldn't update product: ${result.errmsg}`});
    }
})

module.exports = router; 