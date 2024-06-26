const { sendSuccess } = require("./ControllerUtils");
const AuthError = require("../services/errors/AuthError");
const passport = require("passport");

function checkRoles(roles, opts = { isView: false, isSocket: false }) {
  // roles must be an array of role names (strings)
  function check(req, _res, next) {
    if (opts.isSocket) {
      next = () => {};
    }
    req.logger.debug(`Checking if user is authenticated`);
    if (!req.user) {
      if (roles.length == 1 && roles[0] == "notloggedin") return next(); // for routes that explicitly need the user to not be logged in
      throw new AuthError("Not authenticated", {
        name: "NotAuthenticated",
        data: { isView: opts.isView },
      });
    }
    req.logger.debug(`Checking roles for ${req.user.first_name}`);
    if (roles.length == 1 && roles[0] == "notloggedin")
      throw new AuthError("Already logged in", {
        name: "AlreadyLoggedInError",
        data: { isView: opts.isView },
      });
    if (roles.length == 0 || roles[0] == "any") return next(); // any logged user will have access if roles = ["any"] or []
    const role = req.user?.role;
    if (!roles.includes(role)) {
      req.logger.debug(`${role} not found in ${roles}`);
      throw new AuthError("Not authorized", {
        name: "NotAuthorized",
        data: { isView: opts.isView },
      });
    }
    req.logger.debug(`${role} found in ${roles}`);
    next();
  }
  return check;
}

// TODO: make cookie settings use environment variables

const setJWTCookie = (req, res) => {
  res.cookie("jwt", req.user.token, {
    priority: "high",
    httpOnly: true,
    sameSite: "strict", // Protect against CSRF
    maxAge: 86400000, // 1 day
  });
  req.user = req.user.user;
};

async function logout(req, res) {
  res.clearCookie("jwt");
  res.redirect("/login");
}
async function current(req, res, next) {
  if (!req.user) {
    return next(new AuthError("Not logged in"));
  }
  sendSuccess(res, { user: req.user });
}
async function registerLocal(req, res, next) {
  passport.authenticate(
    "register",
    { session: false },
    (err, user, info, status) => {
      if (err) {
        req.logger.warning(`Login attempt failed: ${err.message}`);
        return res.redirect(`/register?err=${err.message}`);
      }
      if (!user) {
        return next(
          new AuthError("Authentication error", { data: { isView: true } }),
        );
      }
      req.user = user;
      setJWTCookie(req, res);
      res.redirect("/profile");
    },
  )(req, res, next);
}
async function loginLocal(req, res, next) {
  passport.authenticate(
    "login",
    { session: false },
    (err, user, info, status) => {
      if (err) {
        req.logger.warning(`Login attempt failed: ${err.message}`);
        return res.redirect(`/login?err=${err.message}`);
      }
      if (!user) {
        return next(
          new AuthError("Authentication error", { data: { isView: true } }),
        );
      }
      req.user = user;
      setJWTCookie(req, res);
      res.redirect("/profile");
    },
  )(req, res, next);
}
async function githubLogin(req, res, next) {
  passport.authenticate("github", {
    session: false,
    scope: ["user:email"],
  })(req, res, next);
}

async function githubCallback(req, res, next) {
  passport.authenticate(
    "github",
    { session: false },
    (err, user, info, status) => {
      if (err) {
        req.logger.warning(`Github login attempt failed: ${err.message}`);
        return res.redirect(`/login?err=${err.message}`);
      }
      if (!user) {
        return next(
          new AuthError("Authentication error", { data: { isView: true } }),
        );
      }
      req.user = user;
      setJWTCookie(req, res);
      res.redirect("/profile");
    },
  )(req, res, next);
}

async function googleLogin(req, res, next) {
  passport.authenticate("google", {
    session: false,
    scope: ["profile", "email"],
  })(req, res, next);
}

async function googleCallback(req, res, next) {
  passport.authenticate(
    "google",
    { session: false },
    (err, user, info, status) => {
      if (err) {
        req.logger.warning(`Google login attempt failed: ${err.message}`);
        return res.redirect(`/login?err=${err.message}`);
      }
      if (!user) {
        return next(
          new AuthError("Authentication error", { data: { isView: true } }),
        );
      }
      req.user = user;
      setJWTCookie(req, res);
      res.redirect("/profile");
    },
  )(req, res, next);
}

module.exports = {
  logout,
  current,
  registerLocal,
  loginLocal,
  githubLogin,
  githubCallback,
  googleLogin,
  googleCallback,
  checkRoles,
};
