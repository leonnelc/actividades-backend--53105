const RefreshToken = require("../models/RefreshToken");
const { JWT_SECRET } = require("../config/config");
const UserDTO = require("../dtos/UserDTO");
const jwt = require("jsonwebtoken");

async function createJWT(user) {
  // only accepts user documents directly from database, not DTOs
  const refreshToken = await createRefreshToken(user._id);
  console.log(`Created refreshToken: ${refreshToken.refreshToken}`);
  const accessToken = await createAccessToken(user, refreshToken.refreshToken);
  return {
    user: accessToken.user,
    accessToken: accessToken.accessToken,
    refreshToken: refreshToken.refreshToken,
  };
}

async function createAccessToken(user, refreshToken) {
  const userdto = new UserDTO(user);
  if (!(await isValid(userdto.id, refreshToken))) {
    throw new Error(`Invalid refresh token`);
  }
  const accessToken = jwt.sign({ user: userdto }, JWT_SECRET, {
    expiresIn: "15m",
  });
  return { user: userdto, accessToken };
}

async function createRefreshToken(userId) {
  const expiresIn = 86400; // 86400 seconds = 1 day
  const refreshToken = jwt.sign({ userId }, JWT_SECRET, {
    expiresIn,
  });
  await RefreshToken.create({
    userId,
    token: refreshToken,
    expiresAt: new Date(Date.now() + expiresIn * 1000),
  });
  return { userId, refreshToken };
}

async function isValid(userId, refreshToken) {
  const tokens = await RefreshToken.find({ userId });
  const token = tokens.find((doc) => {
    return doc.token == refreshToken && doc.expiresAt > Date.now();
  });
  return token ? true : false;
}

async function deleteToken(userId, token) {
  return await RefreshToken.deleteOne({ userId, token });
}

async function deleteAllTokens(userId) {
  return await RefreshToken.deleteMany({ userId });
}

module.exports = {
  isValid,
  createRefreshToken,
  deleteAllTokens,
  deleteToken,
  createJWT,
  createAccessToken,
};
