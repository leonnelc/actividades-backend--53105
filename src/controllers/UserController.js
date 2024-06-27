const UserService = require("../services/UserService");
const MailService = require("../services/MailService");
const { sendSuccess } = require("./ControllerUtils");
const APIError = require("../services/errors/APIError");

async function togglePremium(req, res, next) {
  try {
    const { uid } = req.params;
    const user = await UserService.findById(uid);
    if (user.role == "admin")
      throw new APIError("Admin role can't be changed using this method");
    if (user.role == "premium") {
      await UserService.setRole(uid, "user");
      return sendSuccess(res, {
        message: `User ${user.first_name} role set to user`,
      });
    }
    await UserService.setRole(uid, "premium");
    sendSuccess(res, { message: `User ${user.first_name} role set to user` });
  } catch (error) {
    next(error);
  }
}

async function resetPassword(req, res, next) {
  const { token, password } = req.query;

  try {
    await UserService.resetPassword(token, password);

    sendSuccess(res, { message: "Password has been reset" });
  } catch (error) {
    next(error);
  }
}

async function requestPasswordReset(req, res, next) {
  const { email } = req.query;
  try {
    const token = await UserService.generateResetToken(email);
    MailService.sendMail(
      email,
      "Password reset",
      `<h1>Here's your password reset link</h1><button><a href="http://localhost:8080/resetpassword?token=${token}">Click here</a></button><p>If you didn't request a password reset, ignore this mail</p>`,
    );
    sendSuccess(res, { message: "Reset link sent" });
  } catch (error) {
    next(error);
  }
}

module.exports = { togglePremium, resetPassword, requestPasswordReset };
