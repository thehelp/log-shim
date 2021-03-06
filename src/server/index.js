// # logShim
  // To allow libaries to participate in logging without dictating anything about that
// logging system.

'use strict';

/*
`logShim` is an indirection layer. Call it with your `moduleName` (required) and:

1. If a `logger` object is set, it will return that.
2. Next, if `loadLogger()`, returns something, it will return that.
3. If neither of these returns anything it will return `noopLogger`, which does nothing.

_Note: `shim._fix()` ensures that any object returned from this method has all the
required functions. See `_requiredKeys` below._
*/
var shim = module.exports = function logShim(moduleName) {
  if (!moduleName) {
    throw new Error('moduleName is required!');
  }

  if (shim.logger) {
    return shim._fix(shim.logger);
  }

  var loaded = shim.loadLogger(moduleName);
  if (loaded) {
    return shim._fix(loaded);
  }

  return shim._noopLogger;
};

// Set `logger` to override everything else - this object (after a `_fix()` of course)
// will be passed to all `logShim` users
shim.logger = null;

// `_defaultLoad` first tries to load `bunyan`, then `log4js`, then `winston`, then
// finally `debug`.
shim._defaultLoad = function _defaultLoad(moduleName) {
  var logger;

  logger = shim._loadBunyan(moduleName);
  if (logger) {
    return logger;
  }

  logger = shim._loadLog4js(moduleName);
  if (logger) {
    return logger;
  }

  logger = shim._loadWinston(moduleName);
  if (logger) {
    return logger;
  }

  return shim._loadDebug(moduleName);
};

// Override this to install logic to run when a `logShim` user requests their log object.
shim.loadLogger = shim._defaultLoad;

// Multi-version compat
// ========

// If multiple versions of this library are loaded by a hierarchy of various libraries,
// you won't be able to customize the logging for all of them - only the version you
// install directly. `logShim` registers itself on `global[pkg.name][pkg.version]`, giving
// you access to all loaded shims.

var path = require('path');
var pkg = require(path.join(__dirname + '/../../package.json'));

shim._version = pkg.version;

var registry = global[pkg.name] = global[pkg.name] || {};
var version = registry[pkg.version] = registry[pkg.version] || [];

version.push(shim);

shim.getAllVersions = function getAllVersions() {
  return Object.keys(registry);
};

shim.applyToVersion = function applyToVersion(version, fn) {
  return registry[version].forEach(fn);
};

shim.countAll = function countAll() {
  var count = 0;

  shim.getAllVersions()
    .forEach(function(version) {
      var list = registry[version];
      count += list.length;
    });

  return count;
};


// Specific loggers
// =======

// `_loadWinston` loads a logger from the `winston` node module if it is installed
shim._loadWinston = function _loadWinston(moduleName) {
  var winston = shim._tryRequire('winston');
  if (!winston) {
    return;
  }

  return winston.loggers.get(moduleName);
};

// `_loadBunyan` loads a logger from the `bunyan` node module if it is installed
shim._loadBunyan = function _loadBunyan(moduleName) {
  var bunyan = shim._tryRequire('bunyan');
  if (!bunyan) {
    return;
  }

  var logger = bunyan.createLogger({name: moduleName});
  logger.verbose = logger.debug;
  return logger;
};

// `_loadLog4js` loads a logger from the `log4js` node module if it is installed
shim._loadLog4js = function _loadLog4js(moduleName) {
  var log4js = shim._tryRequire('log4js');
  if (!log4js) {
    return;
  }

  var logger = log4js.getLogger(moduleName);
  logger.verbose = logger.debug;

  return logger;
};

// `_loadDebug` loads a logger from the `debug` node module if it is installed
shim._loadDebug = function _loadDebug(moduleName) {
  var debug = shim._tryRequire('debug');
  if (!debug) {
    return;
  }
  var logger = debug(moduleName);

  var result = {};
  shim._requiredKeys.forEach(function(key) {
    result[key] = logger;
  });
  return result;
};

// Helper methods
// =======

function noop() {}

shim._requiredKeys = ['verbose', 'info', 'warn', 'error'];

// if `key` is a function on `logger`, we return true
shim._check = function _check(key, logger) {
  return logger[key] && typeof logger[key] === 'function';
};

// `_fix` ensures that every logger has all the required methods.
shim._fix = function _fix(logger) {
  shim._requiredKeys.forEach(function(key) {
    if (!shim._check(key, logger)) {
      logger[key] = noop;
    }
  });
  return logger;
};

// You get `_noopLogger` when logging packages are installed - a logger that does nothing.
shim._noopLogger = shim._fix(function noopLogger() {});

// `_tryRequire` allows us to load non-dependency optional node modules
shim._tryRequire = function _tryRequire(module) {
  try {
    return require(module);
  }
  catch (e) {}
};
