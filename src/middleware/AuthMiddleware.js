const passport = require("passport");

function AuthMiddleware(req, res, next) {
  passport.authenticate("jwt", { session: false }, (err, jwt, info) => {
    if (!jwt) {
      res.clearCookie("jwt");
      return next();
    }
    req.user = jwt.user;
    next();
  })(req, res, next);
}

module.exports = AuthMiddleware;
