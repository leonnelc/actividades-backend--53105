const bcrypt = require("bcrypt");

function hash(password) {
  return bcrypt.hashSync(password, bcrypt.genSaltSync(10));
}
function isValidPassword(password, hashedPassword) {
  return bcrypt.compareSync(password, hashedPassword);
}

module.exports = { hash, isValidPassword };
