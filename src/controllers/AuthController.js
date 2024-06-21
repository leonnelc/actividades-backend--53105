/* eslint-disable no-unused-vars */
const { sendSuccess } = require("./ControllerUtils");
const AuthError = require("../services/errors/AuthError");
function checkRoles(roles, isView) {
  // roles must be an array of role names (strings)
  function check(req, _res, next) {
    req.logger.debug(JSON.stringify(req.user));
    if (!req.user) {
      throw new AuthError("Not authenticated", {
        name: "NotAuthenticated",
        data: { isView },
      });
    }
    const role = req.user?.role;
    if (!roles.includes(role)) {
      throw new AuthError("Not authorized", {
        name: "NotAuthorized",
        data: { isView },
      });
    }
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
async function loginGithub(_req, _res) { }
async function callbackGithub(req, res) {
  res.redirect("/profile");
}
async function loginGoogle(_req, _res) { }
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
