const express = require("express");
const ProductManager = require("./ProductManager")
const app = express();
const PUERTO = 8080;
const PRODUCTSPATH = "src/models/products.json"

// Chatgpt usado para generar ejemplos de productos


// Instancio el productmanager
const pm = new ProductManager(PRODUCTSPATH);

app.use(express.urlencoded({extended:true}));

app.get("/", (req, res) => {
    res.send("No hay nada aca, no lo pide en la consigna");
})


app.get("/products", (req, res) => {
    let limit = req.query.limit;
    let products = pm.getProducts();
    if (limit == null){
        res.send(products);
    }else{
        res.send(products.slice(0, limit));
    }
})
app.get("/products/:pid", (req, res) => {
    let product = pm.getProductById(req.params.pid);
    if (product == null){
        res.send(`Producto con id "${req.params.pid}" no encontrado`);
    }else{
        res.send(product);
    }
})

app.listen(PUERTO, () => {
    console.log(`Servidor escuchando en http://localhost:${PUERTO}`);
})