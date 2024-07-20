const APIError = require("../services/errors/APIError");
const ViewError = require("../services/errors/ViewError");
const AuthError = require("../services/errors/AuthError");
const { JsonWebTokenError } = require("jsonwebtoken");

function ErrorHandler(err, req, res, _next) {
  const trace = err.stack.split("\n")[1]?.trim() ?? "No stack trace";
  req.logger.warning({
    message: `${new Date().toUTCString()} | ${
      _next == "socket" ? "SOCKET | " : ""
    }${err.message} | ${trace}`,
  });
  let isView = false;
  function send(status, message, optionalData, view) {
    if (_next == "socket") {
      res.emit("error", message);
      return;
    }
    if (isView) {
      if (view) {
        return res.status(status).render(view, optionalData);
      }
      return res
        .status(status)
        .render("message", { title: "Error", error: true, message });
    }
    return res
      .status(status)
      .json({ status: "error", message, ...optionalData });
  }
  switch (true) {
    case err instanceof APIError:
      switch (err.name) {
        case "NotAuthorized":
          send(300, err.message);
          break;
        case "NotFound":
          send(404, err.message);
          break;
        case "NotEnoughStock":
          send(422, `Items out of stock`, {
            not_purchased: err.data.not_purchased,
          });
          break;
        case "NoPurchasedItems":
          send(422, err.message, { not_purchased: err.data.not_purchased });
          break;
        case "EmptyCart":
          send(422, err.message);
          break;
        default:
          send(500, err.message);
      }
      break;
    case err instanceof ViewError:
      isView = true;
      switch (err.name) {
        default:
          send(500, err.message);
      }
      break;
    case err instanceof AuthError:
      isView = err?.data?.isView ?? false;
      switch (err.name) {
        case "AlreadyLoggedInError":
          send(300, err.message, { user: req.user }, "alreadyloggedin");
          break;
        default:
          send(300, err.message);
      }
      break;
    case err instanceof JsonWebTokenError:
      isView = err?.data?.isView ?? false;
      send(300, err.message);
      break;
    default:
      switch (err.name) {
        case "MulterError":
          send(400, err.message, { field: err.field });
          break;
        case "CastError":
          if (err.kind == "ObjectId") {
            send(500, `${err.value} is not a valid id`);
            break;
          }
          send(500, `The value ${err.value} is not a valid ${err.kind}`);
          break;
        case "MongoServerError":
          switch (err.code) {
            case 11000:
              send(
                500,
                `Duplicated value of key that must be unique: ${Object.keys(
                  err.keyValue,
                )}`,
              );
              break;
            default:
              send(500, `Database error`);
          }
          break;
        default:
          send(500, "Internal server error");
      }
  }
}
module.exports = ErrorHandler;
