const express = require("express");
const router = express.Router();
const session = require("express-session");
const UserManager = require("../controllers/UserManager");
const passport = require("passport");

router.post(
  "/register",
  passport.authenticate("register", {
    failureRedirect: "/register",
  }),
  async (req, res) => {
    if (!req.user) return res.status(400).send("Invalid credentials");

    req.session.user = {
      first_name: req.user.first_name,
      last_name: req.user.last_name,
      age: req.user.age,
      email: req.user.email,
      role: req.user.role,
      cart: req.user.cart
    };
    req.session.username = req.user.first_name;
    req.session.loggedIn = true;

    res.redirect("/profile");
  }
);

router.post(
  "/login",
  passport.authenticate("login", { failureRedirect: "/login" }),
  async (req, res) => {
    if (!req.user) return res.status(400).send("Invalid credentials");

    req.session.user = {
      first_name: req.user.first_name,
      last_name: req.user.last_name,
      age: req.user.age,
      email: req.user.email,
      role: req.user.role,
      cart: req.user.cart
    };
    req.session.username = req.user.first_name;

    req.session.loggedIn = true;

    res.redirect("/profile");
  }
);


router.get("/logout", (req, res) => {
  if (req.session.loggedIn) {
    req.session.destroy();
  }
  res.redirect("/login");
});


router.get(
  "/github",
  passport.authenticate("github", {
    scope: ["user:email"],
    failureRedirect: "/login",
  }),
  async (req, res) => {}
);

router.get(
  "/github/callback",
  passport.authenticate("github", { failureRedirect: "/login" }),
  async (req, res) => {
    req.session.user = req.user;
    req.session.username = req.user.first_name;
    req.session.loggedIn = true;
    res.redirect("/profile");
  }
);

router.get("/google", passport.authenticate("google", {failureRedirect: "/login", scope:["profile", "email"]}));

router.get("/google/callback", passport.authenticate("google", {failureRedirect: "/login"}), async (req, res) => {
  req.session.user = req.user;
  req.session.username = req.user.first_name;
  req.session.loggedIn = true;
  res.redirect("/profile");
})

module.exports = router;
