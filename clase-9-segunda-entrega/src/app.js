const express = require("express");
const mongo = require("mongoose");

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
app.use((req, res, next) => {
    if (!res.locals.send || !res.locals.products){
        next();
        return;
    }
    res.send(res.locals.send);
    socketIO.emit("productList", res.locals.products);
    return;
})
app.use((err, req, res, next) => {
    console.error(err);
    if ('body' in err){
        return res.status(err.status).json({status:"error", message:err.message});
    }
    next();
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

// connect to database

const productsModel = require("./models/products.model");
let connected = false;
console.log("Connecting to database...");
mongo.connect("mongodb+srv://leonnelc:coderhouse@cluster0.euhg3so.mongodb.net/ecommerce?retryWrites=true&w=majority&appName=Cluster0"
).then( async () => {
    console.log("Success connecting to database");
    connected = true;
}).catch( (reason) => {
    throw new Error(`Failure connecting to database, reason: \n${reason}`);
})

