const CartDTO = require("./CartDTO");

function CartsDTO(carts) {
  const cartsDTO = [];
  for (let cart of carts) {
    cartsDTO.push(new CartDTO(cart));
  }
  return cartsDTO;
}

class PaginatedCartDTO {
  constructor(result) {
    this.items = CartsDTO(result.docs);
    this.totalItems = result.totalDocs;
    this.totalPages = result.totalPages;
    this.page = result.page;
    this.hasPrevPage = result.hasPrevPage;
    this.hasNextPage = result.hasNextPage;
    this.prevPage = result.prevPage;
    this.nextPage = result.nextPage;
    this.prevLink = result.prevLink;
    this.nextLink = result.nextLink;
    this.isValidPage = result.page <= result.totalPages;
  }
}
module.exports = PaginatedCartDTO;
