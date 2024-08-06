const TicketDTO = require("./TicketDTO");

function TicketsDTO(tickets) {
  const ticketsDTO = [];
  for (let ticket of tickets) {
    ticketsDTO.push(new TicketDTO(ticket));
  }
  return ticketsDTO;
}

class PaginatedTicketDTO {
  constructor(result) {
    this.items = TicketsDTO(result.docs);
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
module.exports = PaginatedTicketDTO;
