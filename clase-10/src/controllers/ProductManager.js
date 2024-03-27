const productsModel = require("../models/products.model");

class ProductManager {
    #requiredFields
    #notRequiredFields
    constructor(){
        if (!ProductManager.instance){
            // Uso el patron de diseño Singleton para usar la misma instancia de ProductManager en el router de products y en el de carts
            // No es necesario pero es mejor porque no se cargan los datos en memoria 2 veces
            ProductManager.instance = this;
        } else{
            return ProductManager.instance;
        }
        // requiredFields can be modified directly without modifying anything else
        this.#requiredFields = new Set(["title", "description", "price", "code", "stock", "category"]);
        // Fields in notRequiredFields have a default value when not assigned in addProduct()
        // If a field is added to notRequiredFields, its default value must be added to the AddProduct() function
        this.#notRequiredFields = new Set(["thumbnails", "status"]);
    }

    #hasRequiredFields(product){

        const allFields = new Set([...this.#requiredFields, ...this.#notRequiredFields]);
        const productFields = new Set(Object.keys(product));
        for (let field of this.#requiredFields){
            if (!productFields.has(field)){
                console.log(`ERROR: Missing field: ${field}`);
                return `Field is missing: ${field}`};
            }
        
        for (let field of Object.keys(product)){
            if (!allFields.has(field)){
                return `Invalid field: ${field}`;
            }
        }
        return true;
    }
    async addProduct(product){
        // id -1 is returned if it fails, otherwise it will be the id of the new product

        let hasRequiredFields = this.#hasRequiredFields(product);
        if (hasRequiredFields != true){
            return {error:true, message:hasRequiredFields, id:-1};
        }
        product = {
            title: product.title,
            description: product.description,
            price: product.price,
            thumbnails: product.thumbnails ?? [],
            code: product.code,
            stock: parseInt(product.stock),
            category: product.category,
            status: product.status ?? true
        }
        try {
            const newProduct = await productsModel.create(product);
            let saved = await newProduct.save();
            return {error:false, id:saved._id};
        } catch (error) {
            return {error:true, message:error.message, id:-1};
        }
    }
    async deleteProduct(id){
       try {
            await productsModel.findByIdAndDelete(id);
            return {error:false};
        } catch (error) {
            return {error:true, message:error.message};
        }
    }
    async getProductsPaged(options = {limit:10, page:1, query:null, sort:null}){
        options.page = options.page ?? 1;
        options.limit = options.limit ?? 10;
        if (options.sort != null){
            switch (options.sort){
                case "asc":
                    options.sort = {price:1};
                    break;
                case "desc":
                    options.sort = {price:-1};
                    break;
                default:
                    options.sort = undefined;
            }
        }
        let pagOptions = {
            sort:options.sort,
            page:options.page,
            limit:options.limit,
        }
        try {            
            let result = await productsModel.paginate(options.query, pagOptions);
            return {error:false,...result};
        } catch (error) {
            return {error:true, message:error.message};
        }
    }
    async getUniqueProperty(property){
        // returns all unique values of property
        try {
            return await productsModel.distinct(property);
        } catch (error) {
            return {error:true, message:error.message};
        } 

    }
    async getProducts(limit = null){
        if (limit){
            return await productsModel.find().limit(limit);
        }
        return await productsModel.find().lean();
    }
    async getProductById(id){
        try {
            return await productsModel.findById(id);
        } catch (error) {
            return null;
        }
    }
    async getProductByCode(code){
        try {
            return await productsModel.find({code:code});
        } catch (error) {
            return null;
        }
    }
    async updateProduct(id, obj){
        // Updates the fields passed in obj, example:
        // obj={title:"New title", description:"New description"} will update title and description.
        // passing id, null/undefined, or fields that don't exist will have no effect as they will be skipped.
        if (!obj){
            console.error(`Error updating product: ${obj} is not an object`);
            return {error:true, message:`${obj} is not an object`};
        }
        let product;
        try {
            product = await this.getProductById(id);
        } catch (error) {
            product = null;
        }
        if (product == null){
            console.error(`Error updating product: couldn't find product id ${id}`);
            return {error:true, message:`Couldn't find product id ${id}`};
        }
        for (let key of Object.keys(obj)){
            if (key == "id"){
                continue;
            }
            if (Object.keys(product).includes(key)){
                if (obj[key] != null){
                    product[key] = obj[key];
                }
            }
        }
        try {
            await product.save();
            return {error:false};
        } catch (error) {
            return {error:true, message:`Error saving updated product: ${error.message}`};
        }
    }
}

module.exports = ProductManager;