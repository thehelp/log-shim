
'use strict';

var logShim = require('thehelp-log-shim');

var winston = require('winston');

// global winston config
var timestamp = function() {
  var date = new Date();
  return date.toJSON();
};
var options = {
  colorize: true,
  timestamp: timestamp,
  level: 'verbose',
  label: 'default'
};
var transport = new winston.transports.Console(options);

// configure default transports for all loggers in default container
winston.loggers.options.transports = [transport];

// configure the top level default logger
var instantiatedAlready = true;
winston.remove(winston.transports.Console);
winston.add(transport, null, instantiatedAlready);


winston.verbose('test default logger');


var logger = logShim('test:scenarios:winston');

logger.verbose('this is the verbose text');

logger.info('this is the info text', {
  data: {
    yes: 'no'
  }
});

logger.warn('this is the warn text', function(arg1, arg2, arg3, arg4) {
  /*jshint unused: false*/
  logger.warn('warn callback!');
});

logger.error('this is the error %s', 'interpolation');


winston.loggers.add('limited', {
  transports: [new winston.transports.Console({
    level: 'warn',
    timestamp: timestamp,
    colorize: 'true',
    label: 'limited'
  })]
});

var second = logShim('limited');

second.verbose('second verbose should not show up');

second.error('second error should show up');
