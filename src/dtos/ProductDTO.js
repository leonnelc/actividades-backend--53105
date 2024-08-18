class ProductDTO {
  constructor(product) {
    this.id = product._id;
    this.title = product.title;
    this.description = product.description;
    this.category = product.category;
    this.price = product.price;
    this.stock = product.stock;
    this.images = product.images;
    this.thumbnail = product.thumbnail;
    this.status = product.status;
    this.code = product.code;
    this.owner = product.owner == null ? undefined : product.owner.toString();
  }
}
module.exports = ProductDTO;
