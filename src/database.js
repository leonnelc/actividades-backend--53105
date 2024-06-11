const mongoose = require("mongoose");
const { MONGO_URL } = require("./config/config");
const {logger} = require("./utils/logger");

logger.info(`${new Date().toUTCString()} | Connecting to database`);
module.exports = mongoose
  .connect(MONGO_URL)
  .then(() => {
    logger.info(`${new Date().toUTCString()} | Success connecting to database`);
  })
  .catch((reason) => {
    logger.fatal(`${new Date().toUTCString()} | Failure connecting to database, reason: \n${reason}`);
    process.exit(1);
  });
