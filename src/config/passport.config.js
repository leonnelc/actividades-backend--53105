const passport = require("passport");
const LocalStrategy = require("passport-local");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const GitHubStrategy = require("passport-github2");
const PassportController = require("../controllers/PassportController");
const {
  GITHUB_ID,
  GITHUB_SECRET,
  GITHUB_CALLBACK,
  GOOGLE_ID,
  GOOGLE_SECRET,
  GOOGLE_CALLBACK,
} = require("./config");

const initializePassport = () => {
  passport.serializeUser(PassportController.serialize);
  passport.deserializeUser(PassportController.deserialize);

  // Local register
  passport.use(
    "register",
    new LocalStrategy(
      {
        passReqToCallback: true,
        usernameField: "email",
      },
      PassportController.registerLocal
    )
  );

  // Local login
  passport.use(
    "login",
    new LocalStrategy(
      { usernameField: "email", passReqToCallback: true },
      PassportController.loginLocal
    )
  );

  // Github login
  passport.use(
    "github",
    new GitHubStrategy(
      {
        passReqToCallback: true,
        clientID: GITHUB_ID,
        clientSecret: GITHUB_SECRET,
        callbackURL: GITHUB_CALLBACK,
      },
      PassportController.loginGithub
    )
  );

  // Google login
  passport.use(
    new GoogleStrategy(
      {
        passReqToCallback: true,
        clientID: GOOGLE_ID,
        clientSecret: GOOGLE_SECRET,
        callbackURL: GOOGLE_CALLBACK,
      },
      PassportController.loginGoogle
    )
  );
};

module.exports = initializePassport;
