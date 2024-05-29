const ProductManager = require("./controllers/ProductManager");
const ChatManager = require("./controllers/ChatManager");
const pm = new ProductManager();
module.exports = (httpServer) => {
    const io = require('socket.io')(httpServer); // Use received httpServer

    io.on('connection', async (socket) => {
        console.log("User connected :)");
        socket.emit("productList", await pm.getProducts());
        socket.on('disconnect', () => {
            // ...
            console.log("User disconnected :(");
        });



        // real time chat
        let username;
        socket.on("message", (message) => {
            if (username == null){
                socket.emit("error", "You need to log in before sending messages!")
                return;
            }
            message = ChatManager.processMessage(message);
            if (!message){
                return;
            }
            ChatManager.addMessage(username, message);
            io.emit("message", {username:username, message:message});
        })
        socket.on("joinChat", (data) => {
            if (username != null){
                socket.emit("error", "Already logged in");
                return;
            }
            if (!data.username || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.username)){
                socket.emit("invalidLogin");
                //socket.emit("error", "Invalid username");
                return;
            }
            username = data.username;
            socket.emit("validLogin");
        })

        // real time products
        socket.on("getProductList", async () => {
            socket.emit("productList", await pm.getProducts());
        })
        socket.on("deleteProduct", async (pid) => {
            await pm.deleteProduct(pid);
            io.emit("productList", await pm.getProducts());
        })
        socket.on("addProduct", async (product) => {
            let result = await pm.addProduct(product);
            if (result.errmsg == 0){
                io.emit("productList", await pm.getProducts());
            } else{
                console.log(`Error adding product: ${result.errmsg}`);
                socket.emit("error", `Error adding product: ${result.errmsg}`);
            }
        })
    });

    return io;
};