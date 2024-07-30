const fs = require("fs");
const UserService = require("../services/UserService");
const MailService = require("../services/MailService");
const APIError = require("../services/errors/APIError");
const { sendSuccess } = require("./ControllerUtils");
const UserDTO = require("../dtos/UserDTO");
function UsersDTO(users) {
  const usersDTO = [];
  for (const user of users) {
    usersDTO.push(new UserDTO(user));
  }
  return usersDTO;
}

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
function sendDeleteMail(user, reason) {
  MailService.sendMail(
    user.email,
    "User Deletion Notice",
    `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>User Deletion Notice</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            color: #333;
            margin: 0;
            padding: 0;
        }
        .container {
            width: 100%;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f9f9f9;
            border: 1px solid #ddd;
            border-radius: 8px;
        }
        .header {
            text-align: center;
            margin-bottom: 20px;
        }
        .header h1 {
            margin: 0;
            color: #007BFF;
        }
        .message {
            margin-bottom: 20px;
        }
        .footer {
            text-align: center;
            font-size: 0.9em;
            color: #777;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Notification</h1>
        </div>
        <div class="message">
            <p>Hi, ${user.first_name}</p>
            <p>Your account linked to "<strong>${user.email}</strong>" and all the data associated with it has been deleted from our database${reason ?? ""}.</p>
            <p>If you believe this is a mistake, please contact an administrator.</p>
        </div>
        <div class="footer">
            <p>Thank you</p>
        </div>
    </div>
</body>
</html>`,
  );
}

async function deleteUser(req, res, next) {
  const { uid } = req.params;
  try {
    const user = await UserService.deleteById(uid);
    sendSuccess(res, {
      message: `User id ${user._id} deleted succesfully`,
    });
    sendDeleteMail(user);
  } catch (error) {
    next(error);
  }
}

async function deleteInactiveUsers(req, res, next) {
  try {
    const result = await UserService.deleteInactiveUsers(2, (user) =>
      sendDeleteMail(user, " because of inactivity"),
    );
    sendSuccess(res, {
      message: `Deleted ${result.count} inactive user${result.count == 1 ? "" : "s"}`,
    });
  } catch (error) {
    next(error);
  }
}

async function getUsers(req, res, next) {
  try {
    const users = UsersDTO(await UserService.getUsers());
    sendSuccess(res, { users });
  } catch (error) {
    next(error);
  }
}

async function getUsersPaginated(req, res, next) {
  try {
    const result = await UserService.getUsersPaginated(req.query);
    sendSuccess(res, { ...result, items: UsersDTO(result.items) });
  } catch (error) {
    next(error);
  }
}

async function updateRole(req, res, next) {
  try {
    const { uid, role } = req.params;
    const user = await UserService.setRole(uid, role);
    sendSuccess(res, {
      message: `${user.first_name}'s role set to ${user.role}`,
    });
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
  deleteUser,
  deleteInactiveUsers,
  getUsers,
  getUsersPaginated,
  updateRole,
};
