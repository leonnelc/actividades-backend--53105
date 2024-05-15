class CartDTO {
  constructor(cart) {
    this.id = cart._id;
    this.items = cart.items;
    this.total = cart.total;
    this.owner = cart.owner;
  }
}
module.exports = CartDTO;
