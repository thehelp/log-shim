
'use strict';

var bunyan = require('bunyan');

var logShim = require('thehelp-log-shim');

var logger = logShim('test:scenarios:bunyan');

// this should not show up; the default level is info
logger.verbose('this is the default verbose text');

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


// monkey-patching to approximate global configuration
var create = bunyan.createLogger;
bunyan.createLogger = function(options) {
  options.level = 'debug';
  return create(options);
};

// this will show up
var second = logShim('test:scenarios:bunyan:custom');

second.verbose('this is the custom verbose text');
