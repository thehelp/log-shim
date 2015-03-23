
'use strict';

var path = require('path');

var expect = require('thehelp-test').expect;

var util = require('./util');


describe('bunyan', function() {
  var child;

  before(function(done) {
    this.timeout(30000);

    util.setupScenario('bunyan', function(err) {
      if (err) {
        throw err;
      }

      child = util.startProcess(
          path.join(__dirname, '../../scenarios/bunyan/go.js'));

      child.on('close', function() {
        done();
      });
    });
  });

  after(function(done) {
    util.cleanupScenario('bunyan', done);
  });

  it('does not log verbose by default', function() {
    expect(child.stdoutResult).not.to.match(/default verbose text/);
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

  it('logs custom verbose level', function() {
    expect(child.stdoutResult).to.match(/custom verbose text/);
  });

});

