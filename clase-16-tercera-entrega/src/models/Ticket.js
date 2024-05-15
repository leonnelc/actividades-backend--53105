const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Types = Schema.Types;
const ticketSchema = new Schema({
  code: { type: Types.String, required: true, unique: true },
  purchase_datetime: { type: Types.Date, required: true },
  amount: { type: Types.Number, required: true },
  purchaser: { type: Types.String, required: true },
});

const Ticket = mongoose.model("Ticket", ticketSchema);
module.exports = Ticket;
