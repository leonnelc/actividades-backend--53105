/* eslint-disable no-unused-vars */
const { sendSuccess } = require("./ControllerUtils");
const AuthError = require("../services/errors/AuthError");
function checkRoles(roles, isView) {
  // roles must be an array of role names (strings)
  function check(req, _res, next) {
    if (!req.session.user) {
      throw new AuthError("Not authenticated", {
        name: "NotAuthenticated",
        data: { isView },
      });
    }
    const role = req.session.user?.role;
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
async function current(req, res) {
  if (!req.session.loggedIn) {
    throw new AuthError("Not logged in");
  }
  const user = req.session.user;
  sendSuccess(res, { user });
}
async function registerLocal(req, res) {
  if (!req.user) {
    throw new AuthError("Authentication error");
  }
  req.session.user = req.user;
  req.session.loggedIn = true;
  //req.session.registerSuccess = true;
  res.redirect("/profile");
}
async function loginLocal(req, res) {
  if (!req.user) {
    throw new AuthError("Authentication error");
  }
  req.session.user = req.user;
  req.session.loggedIn = true;
  //req.session.loginSuccess = true;
  res.redirect("/profile");
}
async function loginGithub(_req, _res) {}
async function callbackGithub(req, res) {
  req.session.user = req.user;
  req.session.username = req.user.first_name;
  req.session.loggedIn = true;
  res.redirect("/profile");
}
async function loginGoogle(_req, _res) {}
async function callbackGoogle(req, res) {
  req.session.user = req.user;
  req.session.username = req.user.first_name;
  req.session.loggedIn = true;
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
