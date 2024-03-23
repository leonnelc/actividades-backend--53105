const express = require("express");
const router = express.Router();
const ProductManager = require("../controllers/ProductManager");
const getMessages = require("../controllers/ChatManager").getMessages;
const pm = new ProductManager();

function buildQueryString(queryObj, baseString = "", replace={}){
    result = baseString;
    queryObj = {...queryObj, ...replace}
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
router.get("/realtimeproducts", async (req, res) => {
    try {
        res.render("realTimeProducts", {title:"Real time products"});
    } catch (error) {
        res.status(500).send({status:"error", message:"Internal server error"})
        
    }
})
router.get("/", async (req, res) => {
    try {
        let limit, page, sort, query;
        req.query.limit != undefined ? limit = Number(req.query.limit): limit = null;
        req.query.page != undefined ? page = Number(req.query.page): page = null;
        if (["asc", "desc"].includes(req.query.sort)){
            sort = req.query.sort;
        }
        if (req.query.query != null){
            try{
                query = JSON.parse(req.query.query);
            } catch (error){
                res.status(500).send({status:"error", message:`Error parsing query, make sure it's in JSON format`});
                return;
            }
        }
        let result = await pm.getProductsPaged({limit, page, sort, query});
        if (result.error){
            res.status(500).send({status:"error", message:result.message});
            return;
        }
        result.docs = result.docs.map(doc => JSON.parse(JSON.stringify(doc)));
        ({totalPages, prevPage, nextPage, hasPrevPage, hasNextPage, page, prevLink, nextLink, firstLink, lastLink} = result);
        if (hasPrevPage){
            prevLink = buildQueryString(req.query, '', {page:result.page-1});
            firstLink = buildQueryString(req.query, '', {page:1});
        }
        if (hasNextPage){
            nextLink = buildQueryString(req.query, '', {page:result.page+1});
            lastLink = buildQueryString(req.query, '', {page:result.totalPages});
        }

        res.render("home", {title:"Home", products:result.docs, page, totalPages, prevPage, nextPage, hasPrevPage, hasNextPage, prevLink, nextLink, firstLink, lastLink});
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