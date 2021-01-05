const { logger } = require("./domain/logger");
const { start } = require("./domain/bot");
const config = require("config");

logger.info("Starting %s...", config.get("service_name"));
start();
