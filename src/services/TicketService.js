const Ticket = require("../models/Ticket");

async function addTicket({ purchaser, amount, purchase_datetime }) {
  const ticket = new Ticket({
    purchaser,
    amount,
    purchase_datetime,
  });
  return await ticket.save();
}
async function getTickets() {
  return await Ticket.find();
}
async function getTicketById(id) {
  return await Ticket.findById(id);
}
async function getTicketByCode(code) {
  return await Ticket.findOne({ code });
}

module.exports = { addTicket, getTicketByCode, getTicketById, getTickets };
