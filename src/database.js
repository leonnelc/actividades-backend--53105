const mongoose = require("mongoose");
const { MONGO_URL } = require("./config/config");

console.log("Connecting to database");
module.exports = mongoose
  .connect(MONGO_URL)
  .then(() => {
    console.log("Success connecting to database");
  })
  .catch((reason) => {
    throw new Error(`Failure connecting to database, reason: \n${reason}`);
  });
