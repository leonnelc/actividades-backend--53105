const express = require("express");


const PORT = 8080;

const app = express();

const productsRouter = require("./routes/products.router");
const cartsRouter = require("./routes/carts.router");
const viewsRouter = require("./routes/views.router");
const exphbs = require("express-handlebars");


// middlewares 
app.use(express.json());
app.use(express.urlencoded({extended:true}));



// routers
app.use(express.static("./src/public"));
app.use("/api/products", productsRouter);
app.use("/api/carts", cartsRouter);
app.use("/", viewsRouter);
let times = 0;
app.use((req, res, next) => {
    if (!res.locals.send || !res.locals.products){
        next();
        return;
    }
    times++;
    console.log(`Test middleware! ${req.method} ${times}`);
    res.send(res.locals.send);
    socketIO.emit("productList", res.locals.products);
    console.log(res.locals.products);
    return;


})

// express-handlebars & config
app.engine("handlebars", exphbs.engine());
app.set("view engine", "handlebars");
app.set("views", "./src/views");




const httpServer = app.listen(PORT, () => {
    console.log(`Server listening at http://localhost:${PORT}`);
})

// socket.io logic
const socketIO = require('./socket-io')(httpServer);

