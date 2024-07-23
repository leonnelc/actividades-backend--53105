const multer = require("multer");
const fs = require("fs");
const APIError = require("../services/errors/APIError");

const MAX_DOC_SIZE = 5 * 1024 * 1024; // 5 MB in bytes
const MAX_AVATAR_SIZE = 2 * 1024 * 1024; // 2 MB in bytes

const docs_allowed_mimetypes = ["image/png", "image/jpg", "application/pdf"];
const avatar_allowed_mimetypes = ["image/png", "image/jpg"];

const documentDestination = (req, file, cb) => {
  if (!docs_allowed_mimetypes.includes(file.mimetype)) {
    return cb(new APIError(`Mimetype not allowed: ${file.mimetype}`));
  }
  const dir = `${process.cwd()}/data/documents/${req.user.id}`;
  fs.mkdirSync(dir, { recursive: true });
  cb(null, dir);
};

const documentFilename = (req, file, cb) => {
  const ext = `${file.mimetype.replace(/\//g, ".").split(".").pop()}`;
  cb(null, `${file.fieldname}.${ext}`);
};

const avatarDestination = (req, file, cb) => {
  if (!avatar_allowed_mimetypes.includes(file.mimetype)) {
    return cb(new APIError(`Mimetype not allowed: ${file.mimetype}`));
  }
  const dir = `${process.cwd()}/src/public/profiles/${req.user.id}`;
  fs.mkdirSync(dir, { recursive: true });
  cb(null, dir);
};

const avatarFilename = (req, file, cb) => {
  const ext = `${file.mimetype.replace(/\//g, ".").split(".").pop()}`;
  cb(null, `${file.fieldname}.${ext}`);
};

const limits = { fileSize: Infinity };

const middleware = multer({
  storage: multer.diskStorage({
    destination: function (req, file, cb) {
      switch (file.fieldname) {
        case "avatar":
          limits.fileSize = MAX_AVATAR_SIZE;
          avatarDestination(req, file, cb);
          break;
        case "ID":
        case "address_proof":
        case "account_status_proof":
          limits.fileSize = MAX_DOC_SIZE;
          documentDestination(req, file, cb);
          break;
        default:
          cb(new APIError(`Invalid field name: ${file.fieldname}`));
      }
    },
    filename: function (req, file, cb) {
      switch (file.fieldname) {
        case "avatar":
          avatarFilename(req, file, cb);
          break;
        case "ID":
        case "address_proof":
        case "account_status_proof":
          documentFilename(req, file, cb);
          break;
      }
    },
  }),
  limits,
});

module.exports = middleware;
