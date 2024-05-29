const cartsModel = require("../models/carts.model");
class CartManager {
    constructor(ProductManager){
        this.ProductManager = ProductManager;
    }
    async addCart(){
        try {
            const cart = new cartsModel();
            await cart.save();            
            return cart._id;
        } catch (error) {
            return null;     
        }
    }
    async deleteCart(id){
        let cart;
        try {
            cart = await cartsModel.findByIdAndDelete(id).lean();
        } catch (error) {
            return null;
        }
        return cart ? cart._id: null;

    }
    async getCartById(id){
        try {
            return {errmsg:0, cart:await cartsModel.findById(id).lean()};
        } catch (error) {
            if (error.name == "CastError"){
                return {errmsg:"Invalid product id format specified"};
            }
            return {errmsg:error.message, cart:null};
        }
    }
    async getCarts(){
        return await cartsModel.find().lean();
    }
    async addProduct(cartId, prodId, quantity){
        quantity = parseInt(quantity);
        if (quantity <= 0){
            return {errmsg:"Quantity must be a positive integer"};
        }
        let cart;
        let product;
        try {
            cart = await cartsModel.findById(cartId);
            console.log(`cart: ${cart}`);
        } catch (error) {
            if (error.name == "CastError"){
                return {errmsg:"Invalid cart id format specified"};
            }
            return {errmsg:`Error finding cart id ${cartId}: ${error.message}`}
        }
        product = await this.ProductManager.getProductById(prodId);
        //product = await productsModel.findById(prodId);
        if (cart == null){
            return {errmsg:`Cart id ${cartId} doesn't exist`};
        }
        if (product == null){
            return {errmsg:`Product id ${prodId} doesn't exist`};
        }
        const existingProduct = cart.items.find( (item) => {
            return item.productId == prodId;
        })
        if (existingProduct == null){
            cart.items.push({productId:product._id, quantity:quantity});
        } else{
            existingProduct.quantity += quantity;
        }
        try {
            await cart.save();
            return {errmsg:0};
        } catch (error) {
            return {errmsg:`Error saving cart: ${error}`};
        }
        
    }
    async removeProduct(cartId, prodId, quantity=null){
        // Removes $(quantity) number of products of id ${prodId}, deletes all if not specified
        if (quantity != null){
            quantity = parseInt(quantity);
            if (quantity <= 0){
                return {errmsg:"Quantity must be a positive integer"};
            }
        }
        let cart;
        try {
            cart = await cartsModel.findById(cartId);
            console.log(`cart: ${cart}`);
        } catch (error) {
            if (error.name == "CastError"){
                return {errmsg:"Invalid cart id format specified"};
            }
            return {errmsg:`Error finding cart id ${cartId}: ${error.message}`}
        }
        if (cart == null){
            return {errmsg:`Cart id ${cartId} doesn't exist`};
        }
        const productIndex = cart.items.findIndex( (item) => {
            return item.productId == prodId;
        })
        if (productIndex == -1){
            return {errmsg:`Product id ${prodId} not found in cart id ${cartId}`};
        }
        let product = cart.items.at(productIndex);
        if (quantity == null || quantity >= product.quantity){
            cart.items.splice(productIndex, 1);
        } else{
            cart.items.set(productIndex, {productId:product.productId, quantity:product.quantity - quantity});
        }
        try {
            await cart.save();
            return {errmsg:0}
        } catch (error) {
            return {errmsg:`Error saving cart after removing product: ${error.message}`};
        }
    }
    async getCartProducts(cid){
        try {
            const cart = await cartsModel.findById(cid);
            if (cart == null){
                throw new Error(`Cart with id ${cid} not found`);
            }
            return {errmsg:0, products:cart.items};
        } catch (error) {
            if (error.name == "CastError"){
                return {errmsg:"Invalid cart id format specified", products:null};
            }
            return {errmsg:error.message, products:null};
        }

    }
}
module.exports = CartManager;