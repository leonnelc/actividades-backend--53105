const fs = require("fs");

class ProductManager {
    #products;
    #product_count;
    #filepath;
    constructor(filepath){
        this.#product_count = 0;
        this.#products = [];
        this.#filepath = filepath;
        this.#initialize();
    }
    #updateFile(){
        // Esta funcion carga los datos en memoria al archivo JSON
        try {
            fs.writeFileSync(this.#filepath, JSON.stringify(this.#products));
        } catch (error) {
            console.error(`Error escribiendo '${this.#filepath}': ${error.message}`);
        }
        
    }
    #initialize(){
        // Esta funcion verifica si el archivo existe, si no existe lo crea y si existe carga los datos en memoria.
        if (!fs.existsSync(this.#filepath)){
            console.warn(`${this.#filepath} no existe, va a ser creado.`);
            this.#updateFile();
        }
        try {
            let parsedData = JSON.parse(fs.readFileSync(this.#filepath,"utf-8"));
            if (!Array.isArray(parsedData)){
                let notArrayError = new Error(`Error: "${parsedData}" no es un array`);
                notArrayError.name = "NotArrayError";
                throw notArrayError;
            }
            this.#products = [...parsedData];
            this.#product_count = parsedData.length;

        } catch (error) {
            if (error.name == "SyntaxError"){
                console.error("Archivo JSON Invalido");
            } else if (error.name == "NotArrayError"){
                console.error(error.message);
            }
            throw error;
        } 
    }
    #codeExists(code){ 
        // Devuelve true si el codigo ya se encuentra ocupado por uno de los productos
        for (let product of this.#products){
            if (product.code == code){
                console.log(`ERROR: El code '${code}' ya existe`);
                return true
            }
        }
        return false;
    }
    #isProductValid(product){
        // Devuelve true si el producto no tiene campos nulos o indefinidos
        
        for (let key of Object.keys(product)){
            if (product[key] == null){
                console.log(`ERROR: campos nulos o indefinidos: ${key}`);
                return false;
            }
        }
        return true;
    }
    addProduct(title, description, price, thumbnail, code, stock){
        // Valida y agrega un producto y devuelve su id, devuelve -1 si es un producto invalido

        const product = {
            "title":title,
            "description":description,
            "price":price,
            "thumbnail":thumbnail,
            "code":code,
            "stock":stock,
            "id":this.#product_count
        }
        
        if (!this.#isProductValid(product) || this.#codeExists(product.code)){
            return -1;
        }
        this.#products.push(product);
        this.#product_count++;
        this.#updateFile();
        return product.id;
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
            console.log(`Error eliminando: producto con id ${id} no encontrado`);
            return;
        }
        this.#products.splice(index, 1);
        this.#updateFile();
    }
    getProducts(){
        return this.#products;
    }
    getProductById(id){
        let index = this.#products.findIndex((obj) => {
            if (!Object.keys(obj).includes("id")){
                return false;
            }
            if (obj.id == id){
                return true;
            }
        })
        if (index == -1){
            console.log(`Error: producto con id ${id} no encontrado`);
            return null;
        }
        return this.#products[index];
    }
    updateProduct(id, obj){
        // Actualiza los campos pasados en obj, por ejemplo:
        // obj={title:"Nuevo titulo"} solo va a cambiar el titulo, pero se pueden pasar todos los demas campos
        // si se pasa el id, no se cambia para prevenir errores
        // si se pasa un campo null o undefined, no se cambia
        if (!obj){
            console.error(`Error actualizando producto: ${obj} no es un objeto`);
            return;
        }
        let product = this.getProductById(id);
        if (product == null){
            console.error(`Error actualizando producto: no se pudo encontrar el producto con id ${id}`);
            return;
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
    }


}

module.exports = ProductManager;