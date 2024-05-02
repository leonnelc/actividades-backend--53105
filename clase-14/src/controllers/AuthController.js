const { sendError, sendSuccess } = require("./ControllerUtils");
function adminAuth(req, res, next) {
  if (req.session?.user?.role === "admin") {
    return next();
  }
  return res.status(403).json({ status: "error", message: "Not authorized" });
}
function auth(req, res, next) {
  if (req.session?.loggedIn === true) {
    return next();
  }
  return res
    .status(400)
    .json({ status: "error", message: "Not authenticated" });
}
function viewsAdminAuth(req, res, next) {
  if (req.session?.loggedIn === true && req.session?.user?.role === "admin") {
    return next();
  }
  return res
    .status(403)
    .render("message", { error: true, message: "Not authorized" });
}
function viewsAuth(req, res, next) {
  if (req.session?.loggedIn === true) {
    return next();
  }
  return res.redirect("/login");
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
  req.session.registerSuccess = true;
  res.redirect("/profile");
}
async function loginLocal(req, res) {
  if (!req.user) {
    return sendError(res, new Error("Authentication error"), 500);
  }
  req.session.loginSuccess = true;
  req.session.user = req.user;
  req.session.loggedIn = true;
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
  adminAuth,
  auth,
  viewsAuth,
  viewsAdminAuth,
};
