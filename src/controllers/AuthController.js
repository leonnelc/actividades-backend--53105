/* eslint-disable no-unused-vars */
const { sendSuccess } = require("./ControllerUtils");
const AuthError = require("../services/errors/AuthError");
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

async function logout(req, res) {
  req.session.destroy();
  res.redirect("/login");
}
async function current(req, res, next) {
  if (!req.user) {
    return next(new AuthError("Not logged in"));
  }
  sendSuccess(res, { user: req.user });
}
async function registerLocal(req, res, next) {
  if (!req.user) {
    return next(new AuthError("Authentication error"));
  }
  //req.session.registerSuccess = true;
  res.redirect("/profile");
}
async function loginLocal(req, res, next) {
  if (!req.user) {
    return next(AuthError("Authentication error"));
  }
  //req.session.loginSuccess = true;
  res.redirect("/profile");
}
async function loginGithub(_req, _res) {}
async function callbackGithub(req, res) {
  res.redirect("/profile");
}
async function loginGoogle(_req, _res) {}
async function callbackGoogle(req, res) {
  res.redirect("/profile");
}

module.exports = {
  logout,
  current,
  registerLocal,
  loginLocal,
  loginGithub,
  callbackGithub,
  loginGoogle,
  callbackGoogle,
  checkRoles,
};
