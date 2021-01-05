const bunyan = require("bunyan");
const config = require("config");

let logger = bunyan.createLogger({
  name: config.get("service_name"),
  streams: [
    {
      level: "debug",
      stream: process.stdout,
    },
    {
      level: "debug",
      type: "rotating-file",
      path: `logs/${config.get("service_name")}.log`,
      period: "1d",
    },
  ],
});

module.exports = { logger };
