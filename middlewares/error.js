const httpStatus = require("http-status");
const ApiError = require("./ApiError");
const logger = require("../config/logger");
const config = require("../config/config");

const errorConverter = (error, req, res, next) => {
    if(!(error instanceof ApiError)){
        const statusCode = error.statusCode || httpStatus.INTERNAL_SERVER_ERROR;
        const message = error.message || httpStatus[statusCode];
        error = new ApiError(statusCode, message, false, error.stack);
    }
    next(error);
};

const errorHandler = (error, req, res, next) => {
    if(config.env === 'production' && !error.isOperational){
        error.statusCode = httpStatus.INTERNAL_SERVER_ERROR;
        error.message = httpStatus[error.statusCode];
    }
    res.locals.errorMessage = error.message;

    const response = {
        statusCode : error.statusCode,
        message : error.message,
        stack: error.stack
    };

    if(config.env === 'development'){
        logger.error(error);
    }

    res.status(error.statusCode).send(response);
};

module.exports = {
    errorConverter,
    errorHandler
};