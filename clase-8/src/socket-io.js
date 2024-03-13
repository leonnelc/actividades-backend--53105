const ProductManager = require("./controllers/ProductManager");
const pm = new ProductManager();
module.exports = (httpServer) => {
    const io = require('socket.io')(httpServer); // Use received httpServer

    io.on('connection', (socket) => {
        console.log("User connected :)");
        socket.emit("productList", pm.getProducts());
        socket.on('disconnect', () => {
            // ...
            console.log("User disconnected :(");
        });
        socket.on("getProductList", () => {
            socket.emit("productList", pm.getProducts());
        })
        socket.on("deleteProduct", (pid) => {
            pm.deleteProduct(pid);
            io.emit("productList", pm.getProducts());
        })
        socket.on("addStock", (pid) => {
            if (pm.increaseStock(pid, 1).errmsg == 0){
                io.emit("productList", pm.getProducts());
            }
        })
        socket.on('decStock', (pid) => {
            if (pm.decreaseStock(pid, 1).errmsg == 0){
                io.emit("productList", pm.getProducts());
            }
        })
        socket.on("addProduct", (product) => {
            let result = pm.addProduct(product);
            if (result.errmsg == 0){
                io.emit("productList", pm.getProducts());
            }
        })
    });

    return io;
};