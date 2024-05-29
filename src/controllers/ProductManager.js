const fs = require("fs");

class ProductManager {
    #products;
    #product_count;
    #filepath;
    #requiredFields
    #notRequiredFields
    constructor(filepath){
        if (!ProductManager.instance){
            // Nota para el tutor:
            // Uso el patron de diseño Singleton para usar la misma instancia de ProductManager en el router de products y en el de carts
            // No es necesario pero es mejor porque no se cargan los datos en memoria 2 veces
            ProductManager.instance = this;
        } else{
            return ProductManager.instance;
        }
        if (filepath == null){
            throw new Error("Error instantiating ProductManager, path not specified");
        }
        this.#product_count = 0;
        this.#products = [];
        this.#filepath = filepath;
        // requiredFields can be modified directly without modifying anything else
        this.#requiredFields = new Set(["title", "description", "price", "code", "stock", "category"]);
        // Fields in notRequiredFields have a default value when not assigned in addProduct()
        // If a field is added to notRequiredFields, its default value must be added to the AddProduct() function
        this.#notRequiredFields = new Set(["thumbnails", "status"]);
        this.#initialize();
    }
    #updateFile(){
        try {
            fs.writeFileSync(this.#filepath, JSON.stringify(this.#products));
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
            this.#products = [...parsedData];
            if (parsedData.length > 0){
                this.#product_count = parsedData[parsedData.length-1].id+1;
            } else{
                this.#product_count = parsedData.length;
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
    #codeExists(code){ 
        for (let product of this.#products){
            if (product.code == code){
                console.log(`ERROR: code '${code}' already exists`);
                return true;
            }
        }
        return false;
    }
    #hasNullFields(product){
        
        for (let field of Object.keys(product)){
            if (product[field] == null){
                console.log(`ERROR: null or undefined fields: ${field}`);
                return `null or undefined field: ${field}`;
            }
        }
        return false;
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
    addProduct(product){
        // returns {errmsg, id} where errmsg=0 means success
        // id -1 is returned if it fails, otherwise it will be the id of the new product

        let hasRequiredFields = this.#hasRequiredFields(product);
        if (hasRequiredFields != true){
            return {errmsg: hasRequiredFields, id:-1};
        }
        product = {
            title: product.title,
            description: product.description,
            price: product.price,
            thumbnails: product.thumbnails !== undefined ? product.thumbnails : [],
            code: product.code,
            stock: parseInt(product.stock),
            category: product.category,
            status: product.status !== undefined ? product.status : true,
            id: this.#product_count
        }
        let hasNullFields = this.#hasNullFields(product);
        if (hasNullFields != false){
            return {errmsg: hasNullFields, id:-1};
        }
        if (this.#codeExists(product.code)){
            return {errmsg: `Code ${product.code} already exists`, id:-1};
        }
        this.#products.push(product);
        this.#product_count++;
        this.#updateFile();
        return {errmsg:0, id:product.id};
    }
    deleteProduct(id){
        let index = this.#products.findIndex((obj) => {
            if (!Object.keys(obj).includes("id")){
                return false;
            }
            if (obj.id == id){
                return true;
            }
        })
        if (index == -1){
            console.log(`Delete error: product id ${id} not found`);
            return {errmsg:`product id ${id} not found`};
        }
        this.#products.splice(index, 1);
        this.#updateFile();
        return {errmsg:0};
    }
    getProducts(){
        return this.#products;
    }
    #getIndexById(id){
        return this.#products.findIndex((prod) => {
            if (!Object.keys(prod).includes("id")){
                return false;
            }
            if (prod.id == id){
                return true;
            }
        })
    }
    getProductById(id){
        let index = this.#getIndexById(id);
        if (index == -1){
            console.log(`Error: product id ${id} not found`);
            return null;
        }
        return this.#products[index];
    }
    getProductByCode(code){
        let index = this.#products.findIndex((prod) => {
            if (prod.code == code){
                return true;
            }
            return false;
        })
        if (index == -1){
            console.log(`Product code ${code} not found`);
            return null;
        }
        return this.#products[index];
    }
    updateProduct(id, obj){
        // Updates the fields passed in obj, example:
        // obj={title:"New title", description:"New description"} will update title and description.
        // passing id, null/undefined, or fields that don't exist will have no effect as they will be skipped.
        if (!obj){
            console.error(`Error updating product: ${obj} is not an object`);
            return {errmsg:`${obj} is not an object`};
        }
        let product = this.getProductById(id);
        if (product == null){
            console.error(`Error updating product: couldn't find product id ${id}`);
            return {errmsg:`Couldn't find product id ${id}`};
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
        this.#updateFile();
        return {errmsg:0};
    }
    increaseStock(id, quantity){
        quantity = parseInt(quantity);
        if (quantity <= 0){
            return {errmsg:"Quantity must be a positive integer"};
        }
        let index = this.#getIndexById(id);
        if (index == -1){
            console.log(`Error: product id ${id} not found`);
            return {errmsg:"Product not found"};
        }
        this.#products[index].stock = Math.max(this.#products[index].stock + quantity, 0);
        
        //this.#updateFile();
        return {errmsg:0};
        
    }
    decreaseStock(id, quantity){
        quantity = parseInt(quantity);
        if (quantity <= 0){
            return {errmsg:"Quantity must be a positive integer"};
        }
        let index = this.#getIndexById(id);
        if (index == -1){
            console.log(`Error: product id ${id} not found`);
            return {errmsg:"Product not found"};
        }
        if (this.#products[index].stock <= 0){
            return {errmsg:"Stock is zero"};
        }
        this.#products[index].stock = Math.max(this.#products[index].stock - quantity, 0);
        this.#updateFile();
        return {errmsg:0}
        
    }

}

module.exports = ProductManager;