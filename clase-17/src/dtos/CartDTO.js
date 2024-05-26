const ProductDTO = require("./ProductDTO");
class CartDTO {
  constructor(cart) {
    this.id = cart._id;
    this.products = Array.from(cart.items, ([key, item]) => {
      return {
        ...new ProductDTO(item.product),
        quantity: item.quantity,
      };
    });
    this.total = cart.total;
    this.owner = cart.owner;
  }
}
module.exports = CartDTO;
