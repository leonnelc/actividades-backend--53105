const { logger } = require("../utils/logger");
const dotenv = require("dotenv");
const program = require("../utils/commander");
const { mode } = program.opts();
const config = dotenv.config({
  path: `./.env.${mode}`,
});
if (config.error) {
  logger.error(
    `${new Date().toUTCString()} | Error loading environment variables from .env.${mode}, reason: ${
      config.error
    }\nIf you've set environment variables without .env files, you can ignore this message.`
  );
}
const configObject = {
  PORT: parseInt(process.env.PORT),
  HOSTNAME: process.env.HOSTNAME,
  MONGO_URL: process.env.MONGO_URL,
  GITHUB_ID: process.env.GITHUB_ID,
  GITHUB_SECRET: process.env.GITHUB_SECRET,
  GITHUB_CALLBACK: process.env.GITHUB_CALLBACK,
  GOOGLE_ID: process.env.GOOGLE_ID,
  GOOGLE_SECRET: process.env.GOOGLE_SECRET,
  GOOGLE_CALLBACK: process.env.GOOGLE_CALLBACK,
  JWT_SECRET: process.env.JWT_SECRET,
  DEBUGGING: process.env.DEBUGGING === "true",
  MAIL_USER: process.env.MAIL_USER,
  MAIL_PASS: process.env.MAIL_PASS,
  DISABLE_CACHE: process.env.DISABLE_CACHE === "true",
};
module.exports = configObject;
