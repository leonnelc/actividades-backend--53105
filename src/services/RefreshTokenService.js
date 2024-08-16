const RefreshToken = require("../models/RefreshToken");
const { JWT_SECRET } = require("../config/config");
const UserDTO = require("../dtos/UserDTO");
const jwt = require("jsonwebtoken");
setInterval(deleteExpiredTokens, 15 * 60 * 1000);

async function createJWT({ user, userAgent, ipAddress }) {
  // only accepts user documents directly from database, not DTOs
  //
  const userDTO = new UserDTO(user);
  const userId = userDTO.id;
  const refreshToken =
    (await findDeviceToken({ userId, userAgent, ipAddress })) ||
    (await createRefreshToken({
      userId,
      userAgent,
      ipAddress,
    }));
  const accessToken = await createAccessToken({
    data: { user: userDTO },
    userId: user.id,
    userAgent,
    ipAddress,
    refreshToken,
  });
  return {
    user: userDTO,
    accessToken: accessToken,
    refreshToken,
  };
}

async function createAccessToken({
  data,
  userId,
  refreshToken,
  userAgent,
  ipAddress,
}) {
  if (!(await isValid({ userId, refreshToken, userAgent, ipAddress }))) {
    throw new Error(`Invalid refresh token`);
  }
  const accessToken = jwt.sign(data, JWT_SECRET, {
    expiresIn: "15m",
  });
  return accessToken;
}

async function createRefreshToken({ userId, userAgent, ipAddress }) {
  const expiresIn = 86400; // 86400 seconds = 1 day
  const refreshToken = jwt.sign({ userId }, JWT_SECRET, {
    expiresIn,
  });
  await RefreshToken.create({
    userId,
    userAgent,
    ipAddress,
    token: refreshToken,
    expiresAt: new Date(Date.now() + expiresIn * 1000),
  });
  return refreshToken;
}

async function isValid({ userId, refreshToken, userAgent, ipAddress }) {
  return (await findToken({ userId, refreshToken, userAgent, ipAddress }))
    ? true
    : false;
}

async function findToken({ userId, refreshToken, userAgent, ipAddress }) {
  const token = (
    await RefreshToken.findOne({
      userId,
      userAgent,
      ipAddress,
      token: refreshToken,
      expiresAt: { $gt: new Date() },
    })
  )?.token;
  return token ?? null;
}

async function findDeviceToken({ userId, userAgent, ipAddress }) {
  const token = (
    await RefreshToken.findOne({
      userId,
      userAgent,
      ipAddress,
      expiresAt: { $gt: new Date() },
    })
  )?.token;
  return token ?? null;
}

async function deleteToken(tokenId) {
  return await RefreshToken.findByIdAndDelete(tokenId);
}

async function deleteAllTokens(userId) {
  return await RefreshToken.deleteMany({ userId });
}

async function deleteExpiredTokens() {
  return await RefreshToken.deleteMany({ expiresAt: { $lt: new Date() } });
}

async function getUserTokens(userId) {
  return await RefreshToken.find({ userId });
}

module.exports = {
  isValid,
  createRefreshToken,
  deleteAllTokens,
  deleteToken,
  createJWT,
  createAccessToken,
  deleteExpiredTokens,
  findToken,
  findDeviceToken,
  getUserTokens,
};
