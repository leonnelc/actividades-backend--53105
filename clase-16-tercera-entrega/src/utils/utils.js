const { DEBUGGING } = require("../config/config");
const bcrypt = require("bcrypt");

function debugLog(message) {
  if (!DEBUGGING) return;
  console.log(message);
}
function hash(password) {
  return bcrypt.hashSync(password, bcrypt.genSaltSync(10));
}
function isValidPassword(password, hashedPassword) {
  return bcrypt.compareSync(password, hashedPassword);
}

module.exports = { hash, isValidPassword, debugLog };
