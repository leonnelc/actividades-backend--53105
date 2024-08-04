const ProductDTO = require("./ProductDTO");

function ProductsDTO(products) {
  const productsDTO = [];
  for (let product of products) {
    productsDTO.push(new ProductDTO(product));
  }
  return productsDTO;
}

class PaginatedProductDTO {
  constructor(result) {
    this.items = ProductsDTO(result.docs);
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
module.exports = PaginatedProductDTO;
