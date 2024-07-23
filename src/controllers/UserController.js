const fs = require("fs");
const UserService = require("../services/UserService");
const MailService = require("../services/MailService");
const APIError = require("../services/errors/APIError");
const { sendSuccess } = require("./ControllerUtils");

async function togglePremium(req, res, next) {
  try {
    const { uid } = req.params;
    const user = await UserService.findById(uid);
    if (uid != req.user.id && req.user.role != "admin") {
      throw new APIError("Not authorized to change role of other users");
    }
    if (user.role == "admin")
      throw new APIError("Admin role can't be changed using this method");
    if (user.role == "premium") {
      await UserService.setRole(uid, "user");
      return sendSuccess(res, {
        message: `User ${user.first_name} role set to user`,
      });
    }
    const documents = {};
    for (let doc of user.documents) {
      documents[doc.name] = doc.reference;
    }
    if (
      !documents.ID ||
      !documents.address_proof ||
      !documents.account_status_proof
    ) {
      throw new APIError(
        `Missing documents: ID, proof of address and proof of account status are required to upgrade to premium role`,
      );
    }
    await UserService.setRole(uid, "premium");
    sendSuccess(res, {
      message: `User ${user.first_name} role set to premium`,
    });
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

async function uploadDocuments(req, res, next) {
  const { uid } = req.params;
  const { files } = req;
  try {
    const docs = [];
    for (let key of Object.keys(files)) {
      docs.push(files[key][0]);
    }
    const addedDocs = await UserService.addDocuments(uid, docs);
    sendSuccess(res, { addedDocs });
  } catch (error) {
    next(error);
  }
}

async function uploadAvatar(req, res, next) {
  const { uid } = req.params;
  const { file } = req;
  try {
    const publicpath = file.path.replace(`${process.cwd()}/src/public`, "");
    await UserService.setAvatar(uid, publicpath);
    sendSuccess(res, { message: "Avatar set succesfully" });
  } catch (error) {
    next(error);
  }
}

async function getDocument(req, res, next) {
  const { uid, filename } = req.params;
  try {
    if (!(req.user.id == uid || req.user.role == "admin")) {
      throw new APIError(`Not authorized`);
    }
    const filepath = `${process.cwd()}/data/documents/${uid}/${filename}`;
    if (!fs.existsSync(filepath)) {
      throw new APIError(`Document doesn't exist`);
    }
    res.sendFile(filepath);
  } catch (error) {
    next(error);
  }
}

async function getUserByMail(req, res, next) {
  const { email } = req.params;
  try {
    const user = await UserService.findByEmail(email);
    sendSuccess(res, { user });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  togglePremium,
  resetPassword,
  requestPasswordReset,
  getUserByMail,
  uploadDocuments,
  uploadAvatar,
  getDocument,
};
