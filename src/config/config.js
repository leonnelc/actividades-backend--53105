const dotenv = require("dotenv");
const program = require("../utils/commander");
const {mode} = program.opts();
const config = dotenv.config({
    path: `./.env.${mode}`
})
if (config.error) {
  console.log(`Error loading environment variables`);
  throw config.error;
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
    SESSION_SECRET: process.env.SESSION_SECRET,
    DEBUGGING: process.env.DEBUGGING === "true"
}
module.exports = configObject;
