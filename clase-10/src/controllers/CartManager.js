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
            const result = await cartsModel.findById(id);
            if (result == null){
                return {errmsg:`Cart id ${id} not found`, cart:null};
            }
            return {errmsg:0, cart:result};
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
            const result = await cartsModel.find({_id:cartId});
            cart = result[0];
        } catch (error) {
            if (error.name == "CastError"){
                return {errmsg:"Invalid cart id format specified"};
            }
            return {errmsg:`Error finding cart id ${cartId}: ${error.message}`}
        }
        product = await this.ProductManager.getProductById(prodId);
        if (cart == null){
            return {errmsg:`Cart id ${cartId} doesn't exist`};
        }
        if (product == null){
            return {errmsg:`Product id ${prodId} doesn't exist`};
        }
        const existingProduct = cart.items.find( (item) => {
            return item.product == prodId;
        })
        if (existingProduct == null){
            cart.items.push({product:product._id, quantity:quantity});
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
            const result = await cartsModel.find({_id:cartId}); 
            cart = result[0];
        } catch (error) {
            if (error.name == "CastError"){
                return {errmsg:"Invalid cart id format specified"};
            }
            return {errmsg:`Error finding cart id ${cartId}: ${error.message}`}
        }
        if (cart == null){
            return {errmsg:`Cart id ${cartId} not found`};
        }
        const productIndex = cart.items.findIndex( (item) => {
            return item.product == prodId;
        })
        if (productIndex == -1){
            return {errmsg:`Product id ${prodId} not found in cart id ${cartId}`};
        }
        let product = cart.items.at(productIndex);
        if (quantity == null || quantity >= product.quantity){
            cart.items.splice(productIndex, 1);
        } else{
            cart.items.set(productIndex, {product:product.product, quantity:product.quantity - quantity});
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
            const result = await cartsModel.find({_id:cid});
            const cart = result[0];
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
    async updateQuantity(cid, pid, quantity){
        try {
            const result = await cartsModel.find({_id:cid});
            const cart = result[0];
            if (cart == null){
                return {error:true, message:`Cart id ${cid} not found`};
            }
            const itemIndex = await cart.items.findIndex((doc) => {
                return doc.product == pid;
            });
            if (itemIndex == -1){
              return {error:true, message:`Couldn't find item id ${pid} in cart ${cid}`};  
            }
            cart.items[itemIndex].quantity = quantity;
            if (quantity <= 0){
                cart.items.splice(itemIndex, 1);
            }
            cart.save();
            return {error:false};
        } catch (error) {
            console.log(error)
            return {error:true, message:error.message};
        }
    }
    async updateQuantityMany(cid, items){
        try {
            const result = await cartsModel.find({_id:cid});
            const cart = result[0];
            const indexes = new Map(); // [id, index]
            if (cart == null){
                return {error:true, message:`Cart id ${cid} not found`};
            }
            for (let i in cart.items){
                let id = cart.items[i].product._id.toString();
                indexes.set(id, i);
            }
            for (let i in items){
                if (items[i].product == null || items[i].quantity == null){
                    return {error:true, message:`Objects must contain the properties product and quantity`};
                }
                if (!indexes.has(items[i].product)){

                    if (items[i].quantity <= 0){
                        continue;
                    }
                    if (await this.ProductManager.getProductById(items[i].product) == null){
                        return {error:true, message:`Product id ${items[i].product} doesn't exist`};
                    }
                    indexes.set(items[i].product, cart.items.push({product:items[i].product, quantity:items[i].quantity}));
                    continue;
                }
                if (items[i].quantity <= 0){
                    let index = indexes.get(items[i].product);
                    indexes.delete(items[i].product);
                    cart.items.splice(index, 1);
                    for (let j = 0; j < cart.items.length;j++){
                        let id = cart.items[j].product._id.toString();
                        indexes.set(id, j);
                    }
                    continue;
                }
                cart.items[indexes.get(items[i].product)].quantity = items[i].quantity;
            }
            await cart.save();
            return {error:false};
        } catch (error) {
            console.error(error);
            return {error:true, message:error.message};
        }
    }
}
module.exports = CartManager;