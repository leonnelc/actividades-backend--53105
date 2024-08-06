const Ticket = require("../models/Ticket");
const { escapeRegex } = require("../utils/utils");

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
async function getTicketsPaginated(
  queryParams = { page: 1, limit: 10, sort: "_id", order: "asc", q: "" },
) {
  let {
    page = 1,
    limit = 10,
    sort = "_id",
    order = "asc",
    q = "",
  } = queryParams;
  q = q.trim().toLowerCase();
  const options = {
    page: parseInt(page),
    limit: parseInt(limit),
    sort: { [sort]: order == "asc" ? 1 : -1 },
  };

  const mongoQuery = q
    ? { code: { $regex: escapeRegex(q), $options: "i" } }
    : {};

  const result = await Ticket.paginate(mongoQuery, options);

  return result;
}

async function getUserTicketsPaginated(
  userEmail,
  queryParams = { page: 1, limit: 10, sort: "_id", order: "asc", q: "" },
) {
  let {
    page = 1,
    limit = 10,
    sort = "_id",
    order = "asc",
    q = "",
  } = queryParams;
  q = q.trim().toLowerCase();
  const options = {
    page: parseInt(page),
    limit: parseInt(limit),
    sort: { [sort]: order == "asc" ? 1 : -1 },
  };

  const mongoQuery = q
    ? { code: { $regex: escapeRegex(q), $options: "i" }, purchaser: userEmail }
    : { purchaser: userEmail };

  const result = await Ticket.paginate(mongoQuery, options);

  return result;
}

module.exports = {
  addTicket,
  getTicketByCode,
  getTicketById,
  getTickets,
  getTicketsPaginated,
  getUserTicketsPaginated,
};
