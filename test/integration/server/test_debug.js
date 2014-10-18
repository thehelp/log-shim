
'use strict';

var path = require('path');

var expect = require('thehelp-test').expect;

var util = require('./util');


describe('debug', function() {
  var child;

  before(function(done) {
    this.timeout(10000);

    util.setupScenario('debug', function(err) {
      if (err) {
        throw err;
      }

      child = util.startProcess(
        path.join(__dirname, '../../scenarios/debug/go.js'),
        {
          env: {
            DEBUG: 'test:scenarios:debug'
          }
        }
      );

      child.on('close', function() {
        done();
      });
    });
  });

  after(function(done) {
    util.cleanupScenario('debug', done);
  });

  it('should have logged verbose', function() {
    expect(child.stderrResult).to.match(/verbose text/);
  });

  it('should have logged info', function() {
    expect(child.stderrResult).to.match(/info text { data: { yes:/);
  });

  it('should have logged warn and printed out the supplied callback', function() {
    expect(child.stderrResult).to.match(/warn text/);
    expect(child.stderrResult).to.match(/jshint unused/);
  });

  it('should have logged error', function() {
    expect(child.stderrResult).to.match(/error interpolation/);
  });

  it('should not log second info', function() {
    expect(child.stderrResult).not.to.match(/the second info/);
  });

});

