const passport = require("passport");
const { JWT_SECRET } = require("../config/config");
const JWT = require("jsonwebtoken");
const UserService = require("../services/UserService");
const UserDTO = require("../dtos/UserDTO");
const AuthError = require("../services/errors/AuthError");
const { createAccessToken } = require("../services/RefreshTokenService");

function AuthMiddleware(req, res, next) {
  passport.authenticate(
    "jwt",
    { session: false },
    async (err, accessToken, info) => {
      req.refreshAccessToken = async (user) => {
        try {
          res.clearCookie("accessToken");
          const ipAddress = req.ip;
          const userAgent = req.headers["user-agent"] || "unknown";
          const refreshToken = req.cookies?.refreshToken;
          if (!refreshToken) return;
          const { userId } = JWT.verify(refreshToken, JWT_SECRET);

          if (!user) {
            user = await UserService.findById(userId);
          }
          user.last_connection = new Date();
          await user.save();
          const userDTO = new UserDTO(user);
          const accessToken = await createAccessToken({
            data: { user: userDTO },
            userId,
            refreshToken,
            userAgent,
            ipAddress,
          });

          res.cookie("accessToken", accessToken, {
            priority: "high",
            httpOnly: true,
            sameSite: "strict", // Protect against CSRF
            maxAge: 15 * 60 * 1000, // 15 minutes
          });
          req.user = userDTO;
        } catch (error) {
          res.clearCookie("refreshToken");
          res.clearCookie("accessToken");
          throw new AuthError(`Invalid refresh token`, {
            name: "InvalidRefreshToken",
          });
        }
      };
      if (!accessToken) {
        res.clearCookie("accessToken");
        await req.refreshAccessToken();
        return next();
      }
      req.user = accessToken.user;
      next();
    },
  )(req, res, next);
}

module.exports = AuthMiddleware;
