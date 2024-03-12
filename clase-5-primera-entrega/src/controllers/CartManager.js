const fs = require("fs");
class CartManager {
    #cart_count
    #carts
    #filepath
    constructor(filepath, ProductManager){
        this.ProductManager = ProductManager;
        this.#cart_count = 0;
        this.#carts = [];
        this.#filepath = filepath;
        this.#initialize();
    }
    #updateFile(){
        try {
            fs.writeFileSync(this.#filepath, JSON.stringify(this.#carts));
        } catch (error) {
            console.error(`Error writing '${this.#filepath}': ${error.message}`);
        }
    }
    #initialize(){
        if (!fs.existsSync(this.#filepath)){
            console.warn(`${this.#filepath} doesn't exist, it will be created.`);
            this.#updateFile();
        }
        try {
            let parsedData = JSON.parse(fs.readFileSync(this.#filepath,"utf-8"));
            if (!Array.isArray(parsedData)){
                let notArrayError = new Error(`Error: "${this.#filepath}" does not contain a JSON formatted array`);
                notArrayError.name = "NotArrayError";
                throw notArrayError;
            }
            this.#carts = [...parsedData];
            if (parsedData.length > 0){
                this.#cart_count = parsedData[parsedData.length-1].id+1;
            } else{
                this.#cart_count = 0;
            }

        } catch (error) {
            if (error.name == "SyntaxError"){
                console.error("Invalid JSON File");
            } else if (error.name == "NotArrayError"){
                console.error(error.message);
            }
            throw error;
        } 
    }
    addCart(){
        // Adds a cart and returns its id
        const cart = {
            id:this.#cart_count,
            products: []
        }
        this.#carts.push(cart)
        this.#cart_count++;
        this.#updateFile();
        return this.#cart_count-1;
    }
    deleteCart(id){
        let index = this.#carts.findIndex((cart) => {
            if (!Object.keys(cart).includes("id")){
                return false;
            }
            if (cart.id == id){
                return true;
            }
        })
        if (index == -1){
            console.log(`Delete error: product id ${id} not found`);
            return {errmsg:`product id ${id} not found`};
        }
        this.#carts.splice(index, 1);
        this.#updateFile();
        return {errmsg:0};

    }
    getCartById(id){
        let index = this.#carts.findIndex((cart) => {
            if (!Object.keys(cart).includes("id")){
                return false;
            }
            if (cart.id == id){
                return true;
            }
        })
        if (index == -1){
            console.log(`Error: cart id ${id} not found`);
            return null;
        }
        return this.#carts[index];
    }
    getCarts(){
        return [...this.#carts];
    }
    #getProductById(cart, pid){
        return cart.products.find((value) => {
            return (value.id == pid);
        })
    }
    addProduct(cartId, prodId, quantity){
        quantity = parseInt(quantity);
        
        const cart = this.getCartById(cartId);
        if (cart == null){
            return {errmsg:`Cart id ${cartId} doesn't exist`};
        }

        const product = this.ProductManager.getProductById(prodId);
        if (product == null){
            return {errmsg:`Product id ${prodId} doesn't exist`};
        }

        const cartProduct = this.#getProductById(cart, prodId);
        if (cartProduct != null){
            quantity += cartProduct.quantity;
        }

        if (product.stock < quantity){
            return {errmsg:`Product stock (${product.stock}) is less than the requested quantity (${quantity})`};
        }
        if (cartProduct == null){
            cart.products.push({
                id: prodId,
                quantity: quantity
            });
        }else{
            cartProduct.quantity = quantity;
        }
        this.#updateFile();
        return {errmsg:0};
        
    }
    removeProduct(cartId, prodId, quantity=null){
        // Removes $(quantity) number of products of id ${prodId}, deletes all if not specified
        let cart = this.getCartById(cartId);
        // To implement:
        throw new Error("CartManager.removeProduct not implemented yet"); 
    }
}
module.exports = CartManager;