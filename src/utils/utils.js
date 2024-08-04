const bcrypt = require("bcrypt");
const { JWT_SECRET } = require("../config/config");
const UserDTO = require("../dtos/UserDTO");
const jwt = require("jsonwebtoken")

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

function createJWT(user) {
  const userdto = new UserDTO(user);
  const accessToken = jwt.sign({ user: userdto }, JWT_SECRET, {
    expiresIn: "15m",
  });
  const refreshToken = jwt.sign({ user: userdto.id }, JWT_SECRET, {
    expiresIn: "1d",
  });
  return { user: userdto, accessToken, refreshToken };
}

module.exports = { hash, isValidPassword, escapeRegex, createJWT };
