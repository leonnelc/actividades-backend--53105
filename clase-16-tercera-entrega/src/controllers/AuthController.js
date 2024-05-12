const { sendError, sendSuccess } = require("./ControllerUtils");
function checkRoles(roles, isView) {
  // roles must be an array of role names (strings)
  function check(req, res, next) {
    if (!req.session.user) {
      return sendError(res, new Error("Not authenticated"), 400, isView);
    }
    const role = req.session.user?.role;
    if (!roles.includes(role)) {
      return sendError(res, new Error("Not authorized"), 403, isView);
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
    return sendError(res, new Error("Not logged in"), 400);
  }
  sendSuccess(res, { session: req.session.user });
}
async function registerLocal(req, res) {
  if (!req.user) {
    return sendError(res, new Error("Authentication error"), 500);
  }
  req.session.user = req.user;
  req.session.loggedIn = true;
  //req.session.registerSuccess = true;
  res.redirect("/profile");
}
async function loginLocal(req, res) {
  if (!req.user) {
    return sendError(res, new Error("Authentication error"), 500);
  }
  req.session.user = req.user;
  req.session.loggedIn = true;
  //req.session.loginSuccess = true;
  res.redirect("/profile");
}
async function loginGithub(req, res) {}
async function callbackGithub(req, res) {
  req.session.user = req.user;
  req.session.username = req.user.first_name;
  req.session.loggedIn = true;
  res.redirect("/profile");
}
async function loginGoogle(req, res) {}
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
