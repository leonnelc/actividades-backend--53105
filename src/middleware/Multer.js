const multer = require("multer");
const fs = require("fs");
const APIError = require("../services/errors/APIError");

const MAX_DOC_SIZE = 5 * 1024 * 1024; // 5 MB in bytes
const MAX_AVATAR_SIZE = 2 * 1024 * 1024; // 2 MB in bytes
const MAX_IMAGES_PER_PRODUCT = 4;

const docs_allowed_mimetypes = ["image/png", "image/jpeg", "application/pdf"];
const images_allowed_mimetypes = [
  "image/jpeg", // JPEG
  "image/png", // PNG
  "image/gif", // GIF
  "image/webp", // WebP
  "image/svg+xml", // SVG
  "image/bmp", // BMP
  "image/x-icon", // ICO
  "image/avif", // AVIF
];

const documentDestination = (req, file, cb) => {
  if (!docs_allowed_mimetypes.includes(file.mimetype)) {
    return cb(new APIError(`Mimetype not allowed: ${file.mimetype}`));
  }
  const dir = `${process.cwd()}/data/documents/${req.user.id}`;
  fs.mkdirSync(dir, { recursive: true });
  cb(null, dir);
};

const avatarDestination = (req, file, cb) => {
  if (!images_allowed_mimetypes.includes(file.mimetype)) {
    return cb(new APIError(`Mimetype not allowed: ${file.mimetype}`));
  }
  const dir = `${process.cwd()}/src/public/profiles/${req.user.id}`;
  fs.mkdirSync(dir, { recursive: true });
  cb(null, dir);
};

const productImageDestination = (req, file, cb) => {
  if (!images_allowed_mimetypes.includes(file.mimetype)) {
    return cb(new APIError(`Mimetype not allowed: ${file.mimetype}`));
  }
  const dir = `${process.cwd()}/src/public/images/products/${req.params.pid}`;
  req.productImagesDir = dir;
  fs.mkdirSync(dir, { recursive: true });
  cb(null, dir);
};

const productImageFilename = (req, file, cb) => {
  const ext = `${file.originalname.split(".").pop()}`;
  if (!ext) throw new APIError(`Invalid file extension`);
  const images = fs.readdirSync(req.productImagesDir);
  if (images.length >= MAX_IMAGES_PER_PRODUCT) {
    return cb(
      new APIError(
        `Maximum number of product images exceeded. You can only upload up to ${MAX_IMAGES_PER_PRODUCT} images per product.`,
      ),
    );
  }

  let max = 0;
  for (let image of images) {
    const [name, extension] = image.split(".");
    const number = parseInt(name);
    if (number > max) {
      max = number;
    }
  }
  const filename = `${max + 1}.${ext}`;
  cb(null, filename);
};

const makeFilename = (req, file, cb) => {
  const ext = `${file.originalname.split(".").pop()}`;
  if (!ext) throw new APIError(`Invalid file extension`);
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
        case "productImage":
          productImageDestination(req, file, cb);
          break;
        default:
          cb(new APIError(`Invalid field name: ${file.fieldname}`));
      }
    },
    filename: function (req, file, cb) {
      switch (file.fieldname) {
        case "avatar":
        case "ID":
        case "address_proof":
        case "account_status_proof":
        case "productImage":
          productImageFilename(req, file, cb);
          break;
        default:
          makeFilename(req, file, cb);
      }
    },
  }),
  limits,
});

module.exports = middleware;
