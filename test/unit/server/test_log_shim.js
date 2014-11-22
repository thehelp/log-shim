
'use strict';

var test = require('thehelp-test');
var expect = test.expect;
var sinon = test.sinon;

var logShim = require('../../../src/server');

describe('logShim', function() {

  afterEach(function() {
    logShim.logger = null;
    logShim.loadLogger = logShim._defaultLoad;
  });

  it('is set up with proper defaults', function() {
    expect(logShim).to.have.property('logger', null);
    expect(logShim).to.have.property('loadLogger', logShim._defaultLoad);
  });

  it('returns an object with four keys, all functions', function() {
    var logger = logShim('tests:unit');

    expect(logger).to.have.property('verbose').that.is.a('function');
    expect(logger).to.have.property('info').that.is.a('function');
    expect(logger).to.have.property('warn').that.is.a('function');
    expect(logger).to.have.property('error').that.is.a('function');
  });

  it('noop logger doesn\'t do anything', function() {
    var logger = logShim('tests:unit');

    logger.verbose('verbose message');
    logger.info('info message');
    logger.warn('warn message');
    logger.error('error message');
  });

  it('fixes provided empty logger object', function() {
    logShim.logger = {};
    var logger = logShim('tests:unit');

    expect(logger).to.have.property('verbose').that.is.a('function');
    expect(logger).to.have.property('info').that.is.a('function');
    expect(logger).to.have.property('warn').that.is.a('function');
    expect(logger).to.have.property('error').that.is.a('function');
  });

  it('throws an error if no moduleName is provided', function() {
    expect(function() {
      logShim();
    }).to['throw']().that.match(/moduleName is required!/);
  });

  it('fixes provided loadLogger() function that returns empty object', function() {
    logShim.loadLogger = function() {
      return {};
    };

    var logger = logShim('tests:unit');

    expect(logger).to.have.property('verbose').that.is.a('function');
    expect(logger).to.have.property('info').that.is.a('function');
    expect(logger).to.have.property('warn').that.is.a('function');
    expect(logger).to.have.property('error').that.is.a('function');
  });

  describe('multi-version support', function() {
    var pkg = require('../../../package.json');

    after(function() {
      global[pkg.name][pkg.version] = [logShim];
    });

    it('single version installed', function() {
      expect(global[pkg.name][pkg.version]).to.have.length(1);
      expect(logShim.countAll()).to.equal(1);

      var versions = logShim.getAllVersions();
      expect(versions).to.have.length(1);
      expect(versions).to.have.property('0').that.is.a('string');

      var fn = sinon.stub();
      logShim.applyToVersion(versions[0], fn);
      expect(fn).to.have.property('callCount', 1);
    });

    it('multiple of same version installed', function() {
      global[pkg.name][pkg.version].push(logShim);
      expect(logShim.countAll()).to.equal(2);

      var versions = logShim.getAllVersions();
      expect(versions).to.have.length(1);
      expect(versions).to.have.property('0').that.is.a('string');

      var fn = sinon.stub();
      logShim.applyToVersion(versions[0], fn);
      expect(fn).to.have.property('callCount', 2);
    });

    it('multiple of two different versions installed', function() {
      global[pkg.name]['future.version'] = [logShim, logShim];

      expect(logShim.countAll()).to.equal(4);

      var versions = logShim.getAllVersions();
      expect(versions).to.have.length(2);
      expect(versions).to.have.property('0').that.is.a('string');
      expect(versions).to.have.property('1').that.is.a('string');

      var fn = sinon.stub();
      logShim.applyToVersion(versions[0], fn);
      expect(fn).to.have.property('callCount', 2);

      logShim.applyToVersion(versions[1], fn);
      expect(fn).to.have.property('callCount', 4);
    });
  });

  describe('#tryRequire', function() {
    it('does not crash on random module', function() {
      logShim._tryRequire('randomcrap');
    });

    it('load something that is in the project', function() {
      var async = logShim._tryRequire('async');
      expect(async).to.have.property('map').that.is.a('function');
    });
  });

});
