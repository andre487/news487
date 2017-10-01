'use strict';
const moment = require('moment');
const winston = require('winston');

const logTransport = new winston.transports.Console({
    timestamp() {
        return Date.now();
    },
    formatter(options) {
        const time = moment(options.timestamp()).format('YYYY-MM-DD HH:mm:ss');
        const meta = options.meta || {};

        let message = options.message || '';
        if (!message) {
            message = meta.message || '';
        }

        // Empty cells inserted to compatibility with Python services
        // where there are file and line in this places
        let logLine = `${time} ${options.level.toUpperCase()}\t${message}\t\t`;

        if (meta.stack) {
            const strStack = Array.isArray(meta.stack) ?
                meta.stack.join('\\n') :
                meta.stack.replace(/\n/mg, '\\n');

            logLine += `\t${strStack}`;
        }

        const duration = meta.durationMs;
        if (duration != null) {
            logLine += `\tDuration: ${duration}`;
        }

        return logLine;
    }
});

const logger = new winston.Logger({ transports: [logTransport] });
winston.handleExceptions(logTransport);

console.info = console.log = logger.info.bind(logger);
console.error = logger.error.bind(logger);
console.profile = console.profileEnd = logger.profile.bind(logger);

module.exports = logger;
