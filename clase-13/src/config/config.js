const dotenv = require("dotenv");
const program = require("../utils/commander");
const {mode} = program.opts();
dotenv.config({
    path: `./.env.${mode}`
})
const configObject = {
    PORT: parseInt(process.env.PORT),
    HOSTNAME: process.env.HOSTNAME,
    MONGO_URL: process.env.MONGO_URL,
    GITHUB_ID: process.env.GITHUB_ID,
    GITHUB_SECRET: process.env.GITHUB_SECRET,
    GITHUB_CALLBACK: process.env.GITHUB_CALLBACK,
    GOOGLE_ID: process.env.GOOGLE_ID,
    GOOGLE_SECRET: process.env.GOOGLE_SECRET,
    GOOGLE_CALLBACK: process.env.GOOGLE_CALLBACK
}
module.exports = configObject;