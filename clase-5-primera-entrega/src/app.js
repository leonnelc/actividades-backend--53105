const express = require("express");


const PORT = 8080;

const app = express();

const productsRouter = require("./routes/products.router");
const cartsRouter = require("./routes/carts.router");

// middlewares 
app.use(express.json());
app.use(express.urlencoded({extended:true}));

// routers
app.use("/api/products", productsRouter);
app.use("/api/carts", cartsRouter);
///

app.get("/", (req, res) => {
    res.send("No hay nada aca, no lo pide en la consigna");
})


app.listen(PORT, () => {
    console.log(`Server listening at http://localhost:${PORT}`);
})