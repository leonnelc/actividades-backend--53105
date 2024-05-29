class ProductManager {
    #products;
    #product_count;
    constructor(){
        this.#product_count = 0;
        this.#products = [];
    }
    #codeExists(code){ 
        // Devuelve true si el codigo ya se encuentra ocupado por uno de los productos
        for (let product of this.#products){
            if (product.code == code){

                return true
            }
        }
        return false;
    }
    #isProductValid(product){
        // Devuelve true si el producto es valido y el code no esta repetido
        
        if (this.#codeExists(product.code)){
            console.log("ERROR: Product code already exists");
            return false;
        }

        for (let value of Object.values(product)){
            if (value == null){
                console.log("ERROR: null or undefined fields");
                return false;
            }
        }
        return true;
    }
    addProduct(title, description, price, thumbnail, code, stock){
        // Agrega un producto y devuelve su id, devuelve -1 si no se agrega

        const product = {
            "title":title,
            "description":description,
            "price":price,
            "thumbnail":thumbnail,
            "code":code,
            "stock":stock,
            "id":this.#product_count
        }
        
        if (!this.#isProductValid(product)){
            return -1;
        }
        this.#products.push(product);
        this.#product_count++;
        return product.id;
    }
    getProducts(){
        return this.#products;
    }
    getProductById(id){
        if (id >= this.#product_count || id < 0){
            console.log("ERROR: Product not found");
            return null;
        }
        return this.#products[id];
    }


}




// Proceso de testing
// Se muestra el mensaje "true" si el ProductManager funciona correctamente
let manager = new ProductManager();
console.log(manager.getProducts().length == 0)
let productoCampos = ["producto de prueba",
"Este es un producto prueba",  200,
 "Sin imagen", "abc123", 25];
console.log(manager.addProduct(...productoCampos) == 0);
// Deberia mostrar el array con producto agregado
console.log(manager.getProducts());
console.log(manager.getProducts().length == 1);
// Deberia mostrar un mensaje de error por code duplicado en el caso de que funcione correctamente
console.log(manager.addProduct(...productoCampos) == -1);
// Deberia mostrar otro mensaje de error porque no encuentra el id.
console.log(manager.getProductById(1) == null);
// Deberia mostrar el producto agregado al principio
console.log(manager.getProductById(0));