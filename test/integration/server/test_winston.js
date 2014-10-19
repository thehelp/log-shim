
'use strict';

var path = require('path');

var expect = require('thehelp-test').expect;

var util = require('./util');


describe('winston', function() {
  var child;

  before(function(done) {
    this.timeout(10000);

    util.setupScenario('winston', function(err) {
      if (err) {
        throw err;
      }

      child = util.startProcess(
          path.join(__dirname, '../../scenarios/winston/go.js'));

      child.on('close', function() {
        done();
      });
    });
  });

  after(function(done) {
    util.cleanupScenario('winston', done);
  });

  it('should have logged verbose via the default logger', function() {
    expect(child.stdoutResult).to.match(/test default logger/);
  });

  it('should have logged verbose', function() {
    expect(child.stdoutResult).to.match(/verbose text/);
  });

  it('should have logged info', function() {
    expect(child.stdoutResult).to.match(/info text yes=no/);
  });

  it('should have logged warn', function() {
    expect(child.stdoutResult).to.match(/warn text/);
    expect(child.stdoutResult).to.match(/warn callback/);
    expect(child.stdoutResult).not.to.match(/jshint unused/);
  });

  it('should have logged error', function() {
    expect(child.stderrResult).to.match(/error interpolation/);
  });

  it('should not logged verbose via the second logger', function() {
    expect(child.stdoutResult).not.to.match(/second verbose/);
  });

  it('should logged error via the second logger', function() {
    expect(child.stdoutResult).not.to.match(/\[limited\] second error/);
  });
});
