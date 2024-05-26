const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Types = Schema.Types;
const ticketSchema = new Schema({
  code: { type: Types.String, unique: true, index: true },
  purchase_datetime: { type: Types.Date, required: true },
  amount: { type: Types.Number, required: true },
  purchaser: { type: Types.String, required: true },
});
// Generate a unique code before saving the document
ticketSchema.pre("save", function (next) {
  const ticket = this;

  // Check if the code is already set
  if (ticket.isModified("code")) {
    return next();
  }

  // Generate a unique code
  const generateUniqueCode = () => {
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let code = "";
    for (let i = 0; i < 8; i++) {
      code += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return code;
  };

  // Check if the generated code is unique
  const findUniqueCode = async () => {
    const code = generateUniqueCode();
    const existingTicket = await Ticket.findOne({ code });
    if (existingTicket) {
      return findUniqueCode(); // If the code already exists, generate a new one
    }
    ticket.code = code;
    return next();
  };

  findUniqueCode();
});

const Ticket = mongoose.model("Ticket", ticketSchema);
module.exports = Ticket;
