'use strict'

require('winston-daily-rotate-file');
const { format, createLogger, transports } = require('winston');
const { combine, timestamp, printf } = format;

const timezoned = () => {
    return new Date().toLocaleString('id-ID', {
        timeZone: 'Asia/Jakarta'
    });
}

const myFormat = printf(({ level, message, timestamp }) => {
  return `${timestamp} ${level} ${message}`;
});

var transport = new (transports.DailyRotateFile)({
    filename: 'logs/%DATE%.log',
    datePattern: 'YYYY-MM-DD-HH',
    zippedArchive: false,
    maxSize: '1g',
    format: myFormat,
    level: 'info'
});

const logger = createLogger({
    format: combine(
        timestamp({format: timezoned}),
    ),
    transports: [
        transport
    ]
})

module.exports = logger