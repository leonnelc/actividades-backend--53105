const bcrypt = require("bcrypt");

function hash(password) {
  return bcrypt.hashSync(password, bcrypt.genSaltSync(10));
}
function isValidPassword(password, hashedPassword) {
  return bcrypt.compareSync(password, hashedPassword);
}

const regex = /[/\-\\^$*+?.()|[\]{}]/g;
function escapeRegex(string) {
  return string.replace(regex, "\\$&");
}

module.exports = { hash, isValidPassword, escapeRegex };
