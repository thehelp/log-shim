
'use strict';

var path = require('path');

var expect = require('thehelp-test').expect;

var util = require('./util');


describe('log4js', function() {
  var child;

  before(function(done) {
    this.timeout(10000);

    util.setupScenario('log4js', function(err) {
      if (err) {
        throw err;
      }

      child = util.startProcess(
          path.join(__dirname, '../../scenarios/log4js/go.js'));

      child.on('close', function() {
        done();
      });
    });
  });

  after(function(done) {
    util.cleanupScenario('log4js', done);
  });

  it('should have logged verbose', function() {
    expect(child.stdoutResult).to.match(/verbose text/);
  });

  it('should have logged info', function() {
    expect(child.stdoutResult).to.match(/info text { data: { yes:/);
  });

  it('should have logged warn and printed out the supplied callback', function() {
    expect(child.stdoutResult).to.match(/warn text/);
    expect(child.stdoutResult).to.match(/jshint unused/);
  });

  it('should have logged error', function() {
    expect(child.stdoutResult).to.match(/error interpolation/);
  });

  it('should not log out second info', function() {
    expect(child.stdoutResult).not.to.match(/second info/);
  });

  it('should log out second error', function() {
    expect(child.stdoutResult).to.match(/second error/);
  });
});

