const User = require("../models/User");
const { addCart } = require("./CartService");
const { hash, isValidPassword } = require("../utils/utils");
async function findById(id) {
  const user = await User.findById(id);
  if (!user) {
    throw new Error("User not found");
  }
  return user;
}
async function findByEmail(email) {
  const user = await User.findOne({ email });
  if (!user) {
    throw new Error("User not found");
  }
  return user;
}
async function findOrCreate({
  first_name,
  last_name,
  email,
  password,
  age,
  role,
}) {
  let user = await User.findOne({ email });
  if (!user) {
    user = await User.create({
      first_name,
      last_name,
      email,
      password,
      age,
      role,
      cart: (await addCart(email))._id,
    });
  }
  return user;
}
async function add({ first_name, last_name, email, age, role, password }) {
  const user = await User.create({
    first_name,
    last_name,
    email,
    age,
    role,
    password: hash(password),
    cart: (await addCart(email))._id,
  });
  if (!user) {
    throw new Error("Error creating user");
  }
  return user;
}
async function userExists(email) {
  const user = await User.findOne({ email });
  if (!user) {
    return false;
  }
  return true;
}

module.exports = {
  findByEmail,
  findById,
  findOrCreate,
  userExists,
  add,
  isValidPassword,
};
