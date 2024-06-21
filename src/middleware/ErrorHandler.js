const APIError = require("../services/errors/APIError");
const ViewError = require("../services/errors/ViewError");
const AuthError = require("../services/errors/AuthError");

// eslint-disable-next-line no-unused-vars
async function ErrorHandler(err, req, res, _next) {
  const trace = err.stack.split("\n")[1].trim();
  req.logger.warning({
    message: `${new Date().toUTCString()} | ${err.message} | ${trace}`,
  });
  let isView = false;
  function send(status, message, optionalData) {
    if (isView) {
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
        case "NotEnoughStock":
          send(500, `Items out of stock`, {
            not_purchased: err.data.not_purchased,
          });
          break;
        case "NoPurchasedItems":
          send(500, err.message, { not_purchased: err.data.not_purchased });
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
        default:
          send(300, err.message);
      }
      break;
    default:
      switch (err.name) {
        case "CastError":
          send(
            500,
            `Error converting the value ${err.value} to the type ${err.kind}`,
          );
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
