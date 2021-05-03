const mongoose = require("mongoose");
const app = require("./app");
const config = require("./config/config");
const logger = require("./config/logger");

mongoose.connect(config.mongoose.url, config.mongoose.options).then(() => {
    logger.info("Connected to Database");
    app.listen(config.port, () => {
        logger.info(`Running on port ${config.port}`);
    });
}).catch((error) => {logger.error(error)});