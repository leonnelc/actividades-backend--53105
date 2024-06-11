function sendSuccess(res, payload) {
  res.json({ status: "success", ...payload });
}
function buildQueryString(queryObj, baseString = "", replace = {}) {
  let result = baseString;
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

module.exports = { sendSuccess, buildQueryString };
