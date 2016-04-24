
'use strict';

var fs = require('fs');
var path = require('path');
var fork = require('child_process').fork;
var exec = require('child_process').exec;
var async = require('async');

var rmrf = require('rimraf');
var mkdirp = require('mkdirp');


exports.scenarioBase = path.join(__dirname, '../../scenarios');

exports.scenarioDir = function(name) {
  return path.join(exports.scenarioBase, name);
};

exports.setupScenario = function(name, cb) {
  var root = exports.scenarioDir(name);
  var destDir = path.join(root, 'node_modules/thehelp-log-shim');

  // delete npm3-installed winston
  var winstonDir = path.join(__dirname, '../../../node_modules/winston');

  // copy index.js
  var logShimSrc = path.join(__dirname, '../../../src/server/index.js');
  var logShimDestDir = path.join(destDir, 'src/server');
  var logShimDest = path.join(logShimDestDir, 'index.js');

  // copy shim_package.json
  var pkgSrc = path.join(__dirname, '../../scenarios/shim-package.json');
  var pkgDest = path.join(destDir, 'package.json');

  async.series([
    function(cb) {
      rmrf(winstonDir, cb);
    },
    function(cb) {
      var options = {
        cwd: root
      };
      exec('npm install', options, cb);
    },
    function(cb) {
      // make deep directory for index.js file
      mkdirp(logShimDestDir, cb);
    },
    function(cb) {
      exports.copyFile(logShimSrc, logShimDest, cb);
    },
    function(cb) {
      exports.copyFile(pkgSrc, pkgDest, cb);
    }
  ], cb);
};

exports.copyFile = function(src, dest, cb) {
  fs.readFile(src, function(err, contents) {
    if (err) {
      return cb(err);
    }

    fs.writeFile(dest, contents, cb);
  });
};

exports.cleanupScenario = function(name, cb) {
  var dir = path.join(exports.scenarioDir(name), 'node_modules');
  rmrf(dir, cb);
};

// Start a forked node.js process, both capturing stdout/stderr and piping
// them to this process's stdout/stderr.
exports.startProcess = function(module, options) {
  options = options || {};
  options.silent = true;
  options.stdio = 'pipe';

  var child = fork(module, options);

  if (child.stdout) {
    child.stdoutResult = '';
    child.stdout.on('data', function(data) {
      process.stdout.write(data.toString());
      child.stdoutResult += data;
    });
  }
  if (child.stderr) {
    child.stderrResult = '';
    child.stderr.on('data', function(data) {
      process.stderr.write(data.toString());
      child.stderrResult += data;
    });
  }

  return child;
};
