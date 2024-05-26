const {Command} = require("commander");
const program = new Command(); 
program 
    .option("--mode <mode>", "Working mode", "development")
program.parse();
module.exports = program;