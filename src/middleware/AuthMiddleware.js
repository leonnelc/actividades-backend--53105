const passport = require("passport");
const { JWT_SECRET } = require("../config/config");
const JWT = require("jsonwebtoken");
const UserService = require("../services/UserService");
const {
  createJWT,
  createAccessToken,
} = require("../services/RefreshTokenService");

function AuthMiddleware(req, res, next) {
  passport.authenticate(
    "jwt",
    { session: false },
    async (err, accessToken, info) => {
      req.refreshAccessToken = async (user) => {
        try {
          res.clearCookie("accessToken");
          const refreshToken = req.cookies?.refreshToken;
          if (!refreshToken) return;
          const { userId } = JWT.verify(refreshToken, JWT_SECRET);

          if (!user) {
            user = await UserService.findById(userId);
          }
          user.last_connection = new Date();
          await user.save();

          const jwt = await createAccessToken(user, refreshToken);

          res.cookie("accessToken", jwt.accessToken, {
            priority: "high",
            httpOnly: true,
            sameSite: "strict", // Protect against CSRF
            maxAge: 15 * 60 * 1000, // 15 minutes
          });
          req.user = jwt.user;
        } catch (error) {
          req.logger.debug(`refreshAccessToken error: ${error.message}`);
          res.clearCookie("refreshToken");
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
