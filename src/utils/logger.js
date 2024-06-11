const winston = require("winston");

const customLevelsOptions = {
  levels: {
    fatal: 0,
    error: 1,
    warning: 2,
    info: 3,
    http: 4,
    debug: 5,
  },
  colors: {
    fatal: "black",
    error: "red",
    warning: "yellow",
    info: "blue",
    http: "cyan",
    debug: "white",
  },
};

const logger = winston.createLogger({
  levels: customLevelsOptions.levels,
  transports: [
    new winston.transports.Console({
      level: "info",
      format: winston.format.combine(
        winston.format.colorize({ colors: customLevelsOptions.colors }),
        winston.format.simple(),
      ),
    }),
    new winston.transports.File({ filename: "./errors.log", level: "error" }),
  ],
});

function enableDebugLogging() {
  logger.transports[0].level = "debug";
  logger.transports[1].silent = true;
}

  function addLogger(req, _res, next) {
    req.logger = logger;
    req.logger.http(`${new Date().toUTCString()} | ${req.method} at ${req.url}`);
    next();
  }

  module.exports = { addLogger, logger, enableDebugLogging };
