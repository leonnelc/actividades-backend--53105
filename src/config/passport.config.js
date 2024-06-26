const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const GitHubStrategy = require("passport-github2").Strategy;
const JwtStrategy = require("passport-jwt").Strategy;
const ExtractJwt = require("passport-jwt").ExtractJwt;
ExtractJwt.fromCookie = function (cookieName) {
  return (req) => {
    if (!req.cookies) return null;
    const cookie = req.cookies[cookieName];
    return cookie;
  };
};
const PassportController = require("../controllers/PassportController");
const {
  GITHUB_ID,
  GITHUB_SECRET,
  GITHUB_CALLBACK,
  GOOGLE_ID,
  GOOGLE_SECRET,
  GOOGLE_CALLBACK,
  JWT_SECRET,
} = require("./config");

const initializePassport = () => {
  // JWT Strategy
  passport.use(
    "jwt",
    new JwtStrategy(
      {
        jwtFromRequest: ExtractJwt.fromExtractors([
          ExtractJwt.fromAuthHeaderAsBearerToken(),
          ExtractJwt.fromUrlQueryParameter("jwt"),
          ExtractJwt.fromCookie("jwt"),
        ]),
        secretOrKey: JWT_SECRET,
        passReqToCallback: true,
      },
      PassportController.jwtVerify,
    ),
  );

  // Local register
  passport.use(
    "register",
    new LocalStrategy(
      {
        passReqToCallback: true,
        usernameField: "email",
      },
      PassportController.registerLocal,
    ),
  );

  // Local login
  passport.use(
    "login",
    new LocalStrategy(
      { usernameField: "email", passReqToCallback: true },
      PassportController.loginLocal,
    ),
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
      PassportController.loginGithub,
    ),
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
      PassportController.loginGoogle,
    ),
  );
};

module.exports = initializePassport;
