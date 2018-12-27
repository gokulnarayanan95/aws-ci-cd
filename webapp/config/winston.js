'use strict';
const { createLogger, format, transports } = require('winston');
const fs = require('fs');
const path = require('path');

const env = process.env.profile|| 'dev';
const logDir = './logs';

// Create the log directory if it does not exist
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

const filename = path.join(logDir, 'LogFile.log');

const logger = createLogger({
  // change level if in dev environment versus production
  level: env === 'dev' ? 'debug' : 'info',
  format: format.combine(
    format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss'
    }),
    format.json()
  ),
  transports: [
  /*  new transports.Console({
      level: 'info',
      format: format.combine(
        format.colorize(),
        format.printf(
          info => `${info.timestamp} ${info.level}: ${info.message}`
        )
      )
    }), */
    new transports.File({ filename , handleExceptions:true,  })
  ],
  exitOnError : false


});

 module.exports = { logger: logger }

//logger.info('Hello world');
//logger.warn('Warning message');
//logger.debug('Debugging info');