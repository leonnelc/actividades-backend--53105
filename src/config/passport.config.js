const passport = require("passport");
const LocalStrategy = require("passport-local");
const validator = require("email-validator");

const UserModel = require("../models/user.model");
const UserManager = require("../controllers/UserManager");
const um = new UserManager();

const GitHubStrategy = require("passport-github2");

const initializePassport = () => {
  passport.use(
    "register",
    new LocalStrategy(
      {
        passReqToCallback: true,
        usernameField: "email",
      },
      async (req, username, password, done) => {
        const email = req.body.email?.trim().toLowerCase();
        const age = Number(req.body.age);
        const first_name = req.body.first_name?.trim();
        const last_name = req.body.last_name?.trim();
        if (age <= 0) {
          req.session.invalidRegister = { message: "Invalid age" };
          return done(null, false);
        }
        if (!first_name) {
          req.session.invalidRegister = { message: "First name is required" };
          return done(null, false);
        }
        if (!last_name) {
          req.session.invalidRegister = { message: "Last name is required" };
          return done(null, false);
        }
        if (password.length < 4) {
          req.session.invalidRegister = {
            message: "Invalid password, must be at least 4 characters long",
          };
          return done(null, false);
        }
        if (!validator.validate(email)) {
          req.session.invalidRegister = { message: "Invalid email" };
          return done(null, false);
        }

        try {
          let user = await UserModel.findOne({ email });
          if (user || um.isAdmin(email)) {
            req.session.invalidRegister = { message: "User already exists" };
            return done(null, false);
          }

          let newUser = {
            first_name,
            last_name,
            email,
            age,
            role: "user",
            password: um.hash(password),
          };

          let result = await UserModel.create(newUser);
          return done(null, result);
        } catch (error) {
          return done(error);
        }
      }
    )
  );

  passport.use(
    "login",
    new LocalStrategy(
      { usernameField: "email", passReqToCallback: true },
      async (req, email, password, done) => {
        email = email?.trim()?.toLowerCase();
        try {
            if (um.isValidAdmin(email, password)){
                return done(null, {
                    first_name:"Admin",
                    last_name:" ",
                    role:"admin",
                    email,
                    age:0
                })
            }
          const user = await UserModel.findOne({ email });
          if (!user) {
            req.session.invalidLogin = { message: "User does not exist" };
            return done(null, false);
          }

          if (!um.isValidPassword(password, user.password)) {
            req.session.invalidLogin = { message: "Invalid password" };
            return done(null, false);
          }

          return done(null, user);
        } catch (error) {
          return done(error);
        }
      }
    )
  );

  passport.serializeUser((user, done) => {
    if (user.role == "admin"){
        return done(null, user.email);
    }
    done(null, user._id);
  });

  passport.deserializeUser(async (id, done) => {
    if (um.isAdmin(id)){
        return done(null, {
            first_name:"Admin",
            last_name:" ",
            role:"admin",
            email:id,
            age:0
        });
    }
    let user = await UserModel.findById({ _id: id });
    done(null, user);
  });

  passport.use(
    "github",
    new GitHubStrategy(
      {
        passReqToCallback: true,
        clientID: "e3e155e8b32711986eb7",
        clientSecret: "e5c9e0f4336941e733d805981d9865f7367ab86a",
        callbackURL: "http://localhost:8080/api/sessions/githubcallback",
      },
      async (req, accessToken, refreshToken, profile, done) => {
        try {
          if (!profile._json.email) {
            req.session.invalidLogin = {
              message:
                "Github account email not found, try setting your email to public",
            };
            return done(null, false);
          }
          let user = await UserModel.findOne({ email: profile._json.email });
          if (!user) {
            let newUser = {
              first_name: profile._json.name,
              last_name: " ",
              age: 0,
              email: profile._json.email,
              password: " ",
            };
            let result = await UserModel.create(newUser);
            done(null, result);
          } else {
            done(null, user);
          }
        } catch (error) {
          req.session.invalidLogin = { message: error.message };
          return done(null, false);
        }
      }
    )
  );
};

module.exports = initializePassport;
