const UserService = require("../services/UserService");
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

module.exports = { togglePremium };
