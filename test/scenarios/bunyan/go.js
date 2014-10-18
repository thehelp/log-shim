
'use strict';

var bunyan = require('bunyan');

var logShim = require('thehelp-log-shim');

var logger = logShim('test:scenarios:bunyan');

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



logShim.loadLogger = function(moduleName) {
  var logger = bunyan.createLogger({
    name: moduleName,
    level: 'debug'
  });

  logger.verbose = logger.debug;
  return logger;
};

var second = logShim('test:scenarios:bunyan:custom');

second.verbose('this is the custom verbose text');
