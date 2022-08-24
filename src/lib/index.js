'use strict'

const logger = require('./pino')
const winston = require('./winston')

const lib = {
    log: logger,
    winston: winston
}

module.exports = lib