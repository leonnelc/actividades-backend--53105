const { sendSuccess } = require("./ControllerUtils");
const AuthError = require("../services/errors/AuthError");
const RefreshTokenService = require("../services/RefreshTokenService");
const passport = require("passport");

function checkRoles(roles, opts = { isView: false, isSocket: false }) {
  // roles must be an array of role names (strings)
  function check(req, _res, next) {
    if (opts.isSocket) {
      next = () => {};
    }
    if (!req.user) {
      if (roles.length == 1 && roles[0] == "notloggedin") return next(); // for routes that explicitly need the user to not be logged in
      throw new AuthError("Not authenticated", {
        name: "NotAuthenticated",
        data: { isView: opts.isView },
      });
    }
    if (roles[0] == "notloggedin")
      throw new AuthError("Already logged in", {
        name: "AlreadyLoggedInError",
        data: { isView: opts.isView },
      });
    if (roles[0] == "any") return next(); // any logged user will have access if roles = ["any"]
    const role = req.user?.role;
    if (!roles.includes(role)) {
      throw new AuthError("Not authorized", {
        name: "NotAuthorized",
        data: { isView: opts.isView },
      });
    }
    next();
  }
  return check;
}

const setJWTCookie = (req, res) => {
  res.cookie("refreshToken", req.user.refreshToken, {
    priority: "high",
    httpOnly: true,
    sameSite: "strict", // Protect against CSRF
    maxAge: 86400000, // 1 day
  });
  res.cookie("accessToken", req.user.accessToken, {
    priority: "high",
    httpOnly: true,
    sameSite: "strict", // Protect against CSRF
    maxAge: 15 * 60 * 1000, // 15 minutes
  });
};

async function logout(req, res) {
  res.clearCookie("accessToken");
  res.clearCookie("refreshToken");
  sendSuccess(res, { message: "Logged out succesfully" });
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
        req.logger.warning(`Register attempt failed: ${err.message}`);
        return next(err);
      }
      if (!user) {
        return next(new AuthError(info.message || "Registration error"));
      }
      req.user = user;
      setJWTCookie(req, res);
      sendSuccess(res, { message: "Register success" });
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
        return next(err);
      }
      if (!user) {
        return next(new AuthError(info.message || "Authentication error"));
      }
      req.user = user;
      setJWTCookie(req, res);
      sendSuccess(res, { message: "Logged in succesfully" });
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
        return next(err);
      }
      if (!user) {
        return next(new AuthError(info.message || "Authentication error"));
      }
      req.user = user;
      setJWTCookie(req, res);
      sendSuccess(res, { message: "Logged in succesfully" });
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
        return next(err);
      }
      if (!user) {
        return next(new AuthError(info.message || "Authentication error"));
      }
      req.user = user;
      setJWTCookie(req, res);
      sendSuccess(res, { message: "Logged in succesfully" });
    },
  )(req, res, next);
}

async function deleteTokens(req, res, next) {
  try {
    const { uid } = req.params;
    if (uid != req.user.id && req.user.role != "admin") {
      throw new AuthError(`Not authorized`);
    }
    const result = await RefreshTokenService.deleteAllTokens(uid);
    sendSuccess(res, {
      message: `Refresh tokens deleted`,
      count: result.deletedCount,
    });
  } catch (error) {
    next(error);
  }
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
  deleteTokens,
};
