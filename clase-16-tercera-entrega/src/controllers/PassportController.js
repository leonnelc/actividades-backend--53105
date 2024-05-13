const UserService = require("../services/UserService");
const validator = require("email-validator");
const UserDTO = require("../dtos/UserDTO");
function invalidRegister(req, done, message) {
  req.session.invalidRegister = { message };
  done(null, false);
}
function invalidLogin(req, done, message) {
  req.session.invalidLogin = { message };
  done(null, false);
}
async function registerLocal(req, username, password, done) {
  const email = req.body.email?.trim().toLowerCase();
  const age = Number(req.body.age);
  const first_name = req.body.first_name?.trim();
  const last_name = req.body.last_name?.trim();
  if (age <= 0) {
    return invalidRegister(req, done, "Invalid age");
  }
  if (!first_name) {
    return invalidRegister(req, done, "First name is required");
  }
  if (!last_name) {
    return invalidRegister(req, done, "Last name is required");
  }
  if (password.length < 4) {
    return invalidRegister(
      req,
      done,
      "Invalid password, must be at least 4 characters long"
    );
  }
  if (!validator.validate(email)) {
    return invalidRegister(req, done, "Invalid email");
  }

  try {
    if (await UserService.userExists(email)) {
      return invalidRegister(req, done, "User already exists");
    }
    const user = await UserService.add({
      first_name,
      last_name,
      email,
      age,
      role: "user",
      password,
    });

    return done(null, new UserDTO(user));
  } catch (error) {
    req.session.invalidRegister = { message: error.message };
    return done(null, false);
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
      return invalidLogin(req, done, "Invalid password");
    }

    return done(null, new UserDTO(user));
  } catch (error) {
    req.session.invalidLogin = { message: error.message };
    return done(null, false);
  }
}
async function loginGithub(req, accessToken, refreshToken, profile, done) {
  try {
    if (!profile._json.email) {
      return invalidLogin(
        req,
        done,
        "Github account email not found, try setting your email to public"
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
    return done(null, new UserDTO(user));
  } catch (error) {
    req.session.invalidLogin = { message: error.message };
    return done(null, false);
  }
}
async function loginGoogle(req, accessToken, refreshToken, profile, done) {
  try {
    if (!profile._json.email) {
      return invalidLogin(req, done, "Google account email not found");
    }
    const user = await UserService.findOrCreate({
      first_name: profile._json.given_name,
      email: profile._json.email,
      last_name: profile._json.family_name,
      age: null,
      password: null,
      role: "user",
    });
    return done(null, new UserDTO(user));
  } catch (error) {
    req.session.invalidLogin = { message: error.message };
    return done(null, false);
  }
}
function serialize(user, done) {
  done(null, user.id);
}
async function deserialize(id, done) {
  const user = new UserDTO(await UserService.findById(id));
  done(null, user);
}
module.exports = {
  loginLocal,
  registerLocal,
  loginGithub,
  loginGoogle,
  serialize,
  deserialize,
};
