const { AppConfig } = require('../const');
const winston = require('winston');
const { format } = winston;
const DailyRotateFile = require('winston-daily-rotate-file');

const logger = winston.createLogger({
    format: format.combine(
        format.timestamp(), // Add timestamp to logs
        format.printf(({ level, message, timestamp, ...meta }) => {
            let logMessage = `${'-'.repeat(100)}\n${timestamp} ${level}: \n${message}\n`;
            if (Object.keys(meta).length > 0) {
                logMessage += `${JSON.stringify(meta, null, 2)}\n`;
            }

            return logMessage;
        })
    ),
    transports: [
        new DailyRotateFile({
            filename: 'logs/%DATE%.log', // Log file name pattern
            datePattern: 'YYYY-MM-DD', // Daily rotation pattern
            zippedArchive: true, // Archive rotated files
            maxSize: '20m', // Max size of each log file
            maxFiles: '14d' // Max number of days to keep logs
        }),
    ]
});

//
// If we're not in production then log to the `console` with the format:
// `${info.level}: ${info.message} JSON.stringify({ ...rest }) `
//
if (AppConfig.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple(),
  }));
}

module.exports = logger;