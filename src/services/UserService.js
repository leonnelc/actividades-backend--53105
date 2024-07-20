const User = require("../models/User");
const { addCart } = require("./CartService");
const { hash, isValidPassword } = require("../utils/utils");
const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../config/config");
const APIError = require("./errors/APIError");

async function findById(id) {
  const user = await User.findById(id);
  if (!user) {
    throw new APIError("User not found");
  }
  return user;
}
async function findByEmail(email) {
  const user = await User.findOne({ email });
  if (!user) {
    throw new APIError("User not found");
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
    throw new APIError("Error creating user");
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
async function findByCart(cid) {
  const user = await User.findOne({ cart: cid });
  if (!user) {
    throw new APIError(`User with cart id ${cid} not found`);
  }
  return user;
}
async function setRole(id, role) {
  const user = await findById(id);
  user.role = role;
  await user.save();
}

async function generateResetToken(email) {
  const user = await findByEmail(email);
  const currentPasswordHash = user.password ?? "null";
  const userId = user._id;

  const resetCode = Math.random().toString(36).slice(2, 8).toUpperCase();

  const combinedHash = hash(resetCode + currentPasswordHash);
  const token = jwt.sign({ userId, resetCode, combinedHash }, JWT_SECRET, {
    expiresIn: "1h",
  });
  return token;
}
async function resetPassword(token, newPassword) {
  const { userId, resetCode, combinedHash } = jwt.verify(token, JWT_SECRET);
  const user = await findById(userId);
  const currentPasswordHash = user.password ?? "null";

  if (!newPassword || newPassword.length < 4) {
    throw new APIError(`Password must contain at least 4 characters`, {
      name: "InvalidPasswordError",
    });
  }

  if (!isValidPassword(resetCode + currentPasswordHash, combinedHash)) {
    throw new APIError(`Invalid reset code`, { name: "InvalidResetCodeError" });
  }
  if (isValidPassword(newPassword, currentPasswordHash)) {
    throw new APIError(`New password can't be the same as old password`, {
      name: "SamePasswordError",
    });
  }
  user.password = hash(newPassword);
  return await user.save();
}
async function addDocuments(uid, documents) {
  const user = await findById(uid);
  for (let doc of documents) {
    if (
      !["ID", "address_proof", "account_status_proof"].includes(doc.fieldname)
    ) {
      throw new APIError(`Invalid field name: ${doc.fieldname}`);
    }
    const oldIndex = user.documents.findIndex(
      (oldDoc) => oldDoc.name == doc.fieldname,
    );
    const reference = `/api/users/${uid}/documents/${doc.filename}`;
    if (oldIndex !== -1) {
      user.documents[oldIndex].reference = reference;
    } else {
      user.documents.push({ name: doc.fieldname, reference });
    }
  }
  await user.save();
  return user.documents;
}
async function setAvatar(uid, url) {
  const user = await findById(uid);
  user.avatar = url;
  await user.save();
}

module.exports = {
  findByEmail,
  findById,
  findOrCreate,
  userExists,
  add,
  isValidPassword,
  findByCart,
  setRole,
  generateResetToken,
  resetPassword,
  addDocuments,
  setAvatar,
};
