const UserService = require("../services/UserService");
const AuthError = require("../services/errors/AuthError");
const validator = require("email-validator");
const UserDTO = require("../dtos/UserDTO");
const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../config/config");

function createJWT(user, done) {
  const userdto = new UserDTO(user);
  const token = jwt.sign({ user: userdto }, JWT_SECRET, { expiresIn: "1d" });
  done(null, { user: userdto, token });
}

async function registerLocal(req, username, password, done) {
  const email = req.body.email?.trim().toLowerCase();
  const age = Number(req.body.age);
  const first_name = req.body.first_name?.trim();
  const last_name = req.body.last_name?.trim();

  if (age <= 0) {
    return done(new Error("Invalid age"));
  }
  if (!first_name) {
    return done(new Error("First name is required"));
  }
  if (!last_name) {
    return done(new Error("Last name is required"));
  }
  if (password.length < 4) {
    return done(
      new Error("Invalid password, must be at least 4 characters long"),
    );
  }
  if (!validator.validate(email)) {
    return done(new Error("Invalid email"));
  }

  try {
    if (await UserService.userExists(email)) {
      return done(new Error("User already exists"));
    }
    const user = await UserService.add({
      first_name,
      last_name,
      email,
      age,
      role: "user",
      password,
    });
    createJWT(user, done);
  } catch (error) {
    return done(error);
  }
}

async function loginLocal(req, email, password, done) {
  email = email?.trim()?.toLowerCase();
  try {
    const user = await UserService.findByEmail(email);
    if (
      !user.password ||
      !UserService.isValidPassword(password, user.password)
    ) {
      return done(new AuthError("Invalid credentials"));
    }
    user.last_connection = new Date();
    await user.save();
    createJWT(user, done);
  } catch (error) {
    return done(error);
  }
}

async function loginGithub(req, accessToken, refreshToken, profile, done) {
  try {
    if (!profile._json.email) {
      return done(
        new Error(
          "Github account email not found, try setting your email to public",
        ),
      );
    }
    let user = await UserService.findOrCreate({
      first_name: profile._json.name,
      email: profile._json.email,
      last_name: null,
      age: null,
      password: null,
      role: "user",
    });
    user.last_connection = new Date();
    await user.save();
    createJWT(user, done);
  } catch (error) {
    return done(error);
  }
}

async function loginGoogle(req, accessToken, refreshToken, profile, done) {
  try {
    if (!profile._json.email) {
      return done(new Error("Google account email not found"));
    }
    const user = await UserService.findOrCreate({
      first_name: profile._json.given_name,
      email: profile._json.email,
      last_name: profile._json.family_name,
      age: null,
      password: null,
      role: "user",
    });
    user.last_connection = new Date();
    await user.save();
    createJWT(user, done);
  } catch (error) {
    return done(error);
  }
}

async function jwtVerify(req, jwt_payload, done) {
  try {
    return done(null, { ...jwt_payload });
  } catch (error) {
    return done(error, false);
  }
}

module.exports = {
  loginLocal,
  registerLocal,
  loginGithub,
  loginGoogle,
  jwtVerify,
};
