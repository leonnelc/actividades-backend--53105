const User = require("../models/User");
const { addCart } = require("./CartService");
const { hash, isValidPassword } = require("../utils/utils");
function trimUserData(user) {
  // receives a document and returns user object without sensitive information like the password
  return {
    _id: user._id,
    first_name: user.first_name,
    last_name: user.last_name,
    age: user.age,
    email: user.email,
    role: user.role,
    cart: user.cart,
  };
}
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
      cart: await addCart(email),
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
    cart: await addCart(email),
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
function serialize(user) {
  if (!user?._id) {
    throw new Error("Serialization error, id not found");
  }
  return user._id;
}
async function deserialize(id) {
  const user = await User.findById(id);
  if (!user) {
    throw new Error("Deserialization error, user not found");
  }
  return trimUserData(user);
}

module.exports = {
  findByEmail,
  findById,
  findOrCreate,
  userExists,
  add,
  isValidPassword,
  serialize,
  deserialize,
  trimUserData,
};
