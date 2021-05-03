const winston = require("winston");

const infoFormat = winston.format((info) => {
    if(info instanceof Error){
        Object.assign(info, {message : info.stack});
    }
    return info;
});

const logger = winston.createLogger({
    level : 'info',
    format : winston.format.combine(
        infoFormat(),
        winston.format.printf(({level, message}) => `${level}: ${message}`)
    ),
    transports : [
        new winston.transports.Console()
    ]
});

module.exports = logger;