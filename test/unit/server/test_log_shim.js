
'use strict';

var test = require('thehelp-test');
var expect = test.expect;

var logShim = require('../../../src/server/log_shim');

describe('logShim', function() {

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

});
