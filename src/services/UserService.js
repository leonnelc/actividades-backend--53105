const User = require("../models/User");
const Cart = require("../models/Cart");
const Product = require("../models/Product");
const { addCart } = require("./CartService");
const { hash, isValidPassword, escapeRegex } = require("../utils/utils");
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
  role = role.trim().toLowerCase();
  if (!role) throw new APIError(`Invalid role specified: "${role}"`);
  const user = await findById(id);
  if (user.role == "admin" || role == "admin")
    throw new APIError(`Can't set admin role from API`);
  user.role = role;
  return await user.save();
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

async function deleteUserData(user) {
  await Cart.deleteMany({ owner: user.email });
  await Product.deleteMany({ owner: user._id });
}

async function deleteById(uid) {
  const user = await findById(uid);
  if (user.role == "admin") throw new APIError(`Can't delete admin from API`);
  await User.deleteOne(user);
  await deleteUserData(user);
  return user;
}

/**
 * Deletes users that have been inactive
 * keep in mind that last_connection only updates on login, and the duration of login depends on JWT expiration date
 * @@param {number} days - the number of days that need to have passed after user last connection
 * */
async function deleteInactiveUsers(days, postDelete) {
  const daysAgo = new Date(Date.now() - days * 86400000); // 86400000 = 1 day in ms

  const users = await User.find({
    last_connection: { $lt: daysAgo },
    role: "user",
  });
  const deletedUsers = [];
  for (const user of users) {
    await User.deleteOne(user);
    deleteUserData(user);
    if (typeof postDelete == "function") postDelete(user);
    deletedUsers.push(user._id);
  }
  return { users: deletedUsers, count: deletedUsers.length };
}

async function getUsers() {
  return await User.find();
}

async function getUsersPaginated(
  queryParams = { page: 1, limit: 10, sort: "_id", order: "asc", q: "" },
) {
  let {
    page = 1,
    limit = 10,
    sort = "_id",
    order = "asc",
    q = "",
  } = queryParams;
  q = q.trim().toLowerCase();
  const options = {
    page: parseInt(page),
    limit: parseInt(limit),
    sort: { [sort]: order == "asc" ? 1 : -1 },
  };
  let result;
  if (!q) {
    result = await User.paginate({}, options);
  } else {
    result = await User.paginate(
      { email: { $regex: escapeRegex(q), $options: "i" } },
      options,
    );
  }

  return {
    totalItems: result.totalDocs,
    items: result.docs,
    totalPages: result.totalPages,
    currentPage: result.page,
  };
}

module.exports = {
  findByEmail,
  findById,
  findOrCreate,
  userExists,
  getUsers,
  getUsersPaginated,
  add,
  deleteById,
  deleteInactiveUsers,
  isValidPassword,
  findByCart,
  setRole,
  generateResetToken,
  resetPassword,
  addDocuments,
  setAvatar,
  deleteUserData,
};
