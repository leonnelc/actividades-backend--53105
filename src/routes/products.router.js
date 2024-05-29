const express = require("express");
const router = express.Router();
const ProductManager = require("../controllers/ProductManager")

const pm = new ProductManager();
function buildQueryString(queryObj, baseString = ""){
    result = baseString;
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
router.get("/", async (req, res) => {
    let limit, page, sort, query;
    if (req.query.limit != undefined){
        limit = Number(req.query.limit);
    }
    if (req.query.page != undefined){
        page = Number(req.query.page);
    }
    if (["asc", "desc"].includes(req.query.sort)){
        sort = req.query.sort;
    }
    if (req.query.query != null){
        try{
            query = JSON.parse(req.query.query);
        } catch (error){
            res.send({status:error, message:`Error parsing query: ${error.message}`});
            return;
        }
    }
    let result = await pm.getProductsPaged({limit, page, sort, query});
    if (result.error){
        res.send({status:"error", message:result.message});
        return;
    }
    ({totalPages, prevPage, nextPage, hasPrevPage, hasNextPage, prevLink, nextLink, page} = result);
    prevLink = prevLink ?? null;
    nextLink = nextLink ?? null;
    if (hasPrevPage){
        req.query.page = result.page-1;
        prevLink = buildQueryString(req.query,'products');
    }
    if (hasNextPage){
        req.query.page = result.page+1;
        nextLink = buildQueryString(req.query, 'products');
    }
    let payload = result.docs;
    res.send({status:"success", payload, totalPages, prevPage, nextPage, page, hasPrevPage, hasNextPage, prevLink, nextLink});
})
router.get("/:pid", async (req, res) => {
    let product = await pm.getProductById(req.params.pid);
    if (product == null){
        res.send({status:"error", message:`Product id "${req.params.pid}" not found`});
        return;
    }
    res.send({status:"success", payload:product});
})
router.get("/code/:code", async (req, res) => {
    let product = await pm.getProductByCode(req.params.code);
    if (product == null){
        res.send({status:"error", message:`Product code "${req.params.code} not found`});
        return;
    }
    res.send({status:"success", payload:product});
})

router.post("/", async (req, res, next) => {
    let result = await pm.addProduct(req.body);
    if (result.error){
        res.send({status:"error", message:`Couldn't add product: ${result.message}`});
        return;
    }
    res.locals.send = {status:"success", message:`Product added succesfully with id ${result.id}`};
    res.locals.products = await pm.getProducts();
    next();
})

router.delete("/:pid", async (req, res, next) => {
    let result = await pm.deleteProduct(req.params.pid);
    if (result.error){
        res.send({status:"error", message:`Couldn't delete product: ${result.message}`});
        return;
    }
    res.locals.send = {status:"success", message: "Product deleted succesfully"};
    res.locals.products = await pm.getProducts();
    next();
})

router.put("/:pid", async (req, res, next) => {
    let result = await pm.updateProduct(req.params.pid, req.body);
    if (result.error){
        res.send({status:"error", message:`Couldn't update product: ${result.message}`});
        return;
    }
    res.locals.send = {status:"success", message: "Product succesfully updated"};
    res.locals.products = await pm.getProducts();
    next();
})

module.exports = router; 