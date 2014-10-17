
'use strict';

var logShim = require('thehelp-log-shim');

var core = require('thehelp-core');
core.logs.setupConsole({
  level: 'verbose'
});

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

