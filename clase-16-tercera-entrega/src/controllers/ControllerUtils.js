const { debugLog } = require("../utils/utils");
function sendError(res, error, status) {
  // TODO: implement more custom messages for specific errors like CastError
  debugLog(error);
  function send(status, message) {
    res.status(status).json({ status: "error", message });
  }
  switch (error.name) {
    case "CastError":
      send(
        500,
        `Error converting the value ${error.value} to the type ${error.kind}`
      );
      break;
    case "MongoServerError":
      switch (error.code) {
        case 11000:
          send(
            500,
            `Duplicated value of key that must be unique: ${Object.keys(
              error.keyValue
            )}`
          );
          break;
        default:
          send(500, `Database error`);
      }
      break;
    default:
      send(status ?? 500, error.message);
  }
}
function sendSuccess(res, payload) {
  res.json({ status: "success", ...payload });
}
function buildQueryString(queryObj, baseString = "", replace = {}) {
  result = baseString;
  queryObj = { ...queryObj, ...replace };
  for (let key of Object.keys(queryObj)) {
    if (queryObj[key] == null) {
      continue;
    }
    if (baseString == result) {
      result += `?${key}=${queryObj[key]}`;
      continue;
    }
    result += `&${key}=${queryObj[key]}`;
  }
  return result;
}

module.exports = { sendError, sendSuccess, buildQueryString };
