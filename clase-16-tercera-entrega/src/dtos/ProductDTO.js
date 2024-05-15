class ProductDTO {
  constructor(product) {
    this.id = product._id;
    this.title = product.title;
    this.description = product.description;
    this.category = product.category;
    this.price = product.price;
    this.stock = product.stock;
    this.thumbnails = product.thumbnails;
    this.status = product.status;
    this.code = product.code;
  }
}
module.exports = ProductDTO;
