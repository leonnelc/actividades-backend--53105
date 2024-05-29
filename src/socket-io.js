const ProductManager = require("./controllers/ProductManager");
const ChatManager = require("./controllers/ChatManager");
const pm = new ProductManager();
function authAdmin(socket){
    const session = socket.request.session;
    if (session.user.role === "admin"){
        return;
    }
    socket.emit("error", "You're not authorized to do that.");
    socket.disconnect();
}
module.exports = (httpServer, sessionMiddleware) => {
    const io = require('socket.io')(httpServer); // Use received httpServer
    io.engine.use(sessionMiddleware);
    io.on('connection', async (socket) => {
        if (!socket.request.session.loggedIn){
            socket.emit("error", "Not logged in");
            return socket.disconnect();
        }
        const username = socket.request.session.user.email;
        socket.emit("alert", `Logged in as ${username}`);
        console.log("User connected :)");
        socket.emit("productList", await pm.getProducts());
        socket.on('disconnect', () => {
            // ...
            socket.disconnect();
            console.log("User disconnected :(");
        });

        // real time chat
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
            authAdmin(socket);
            socket.emit("productList", await pm.getProducts());
        })
        socket.on("deleteProduct", async (pid) => {
            authAdmin(socket);
            await pm.deleteProduct(pid);
            io.emit("productList", await pm.getProducts());
        })
        socket.on("addProduct", async (product) => {
            authAdmin(socket);
            let result = await pm.addProduct(product);
            if (result.error){
                console.log(`Error adding product: ${result.message}`);
                socket.emit("error", `Error adding product: ${result.message}`);
            }
            io.emit("productList", await pm.getProducts());
        })
    });

    return io;
};