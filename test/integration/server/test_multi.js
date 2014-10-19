
'use strict';

var path = require('path');

var test = require('thehelp-test');
var expect = test.expect;

var logShim = require('../../../src/server');
var pkg = require('../../../package.json');
var origVersion = pkg.version;

describe('multi', function() {

  var deleteShimCache = function() {
    var shimPath = path.join(__dirname, '../../../src/server/index.js');
    delete require.cache[shimPath];
  };

  var updateVersion = function() {
    var pkg = path.join(__dirname, '../../../package.json');

    require.cache[pkg].exports.version = 'new.version';
  };

  it('starts with one instance in the process', function() {
    expect(logShim.countAll()).to.equal(1);
  });

  it('on delete cache/require, creates second item on version array', function() {
    deleteShimCache();

    require('../../../src/server');
    expect(logShim.countAll()).to.equal(2);

    expect(global)
      .to.have.property(pkg.name)
      .that.have.property(origVersion);
    var version = global[pkg.name][origVersion];
    expect(version).to.have.length(2);
  });

  it('on delete cache/update version/require, creates second version array', function() {
    deleteShimCache();
    updateVersion();

    require('../../../src/server');
    expect(logShim.countAll()).to.equal(3);

    expect(global)
      .to.have.property(pkg.name)
      .that.have.property(origVersion);
    var version = global[pkg.name][origVersion];
    expect(version).to.have.length(2);

    expect(global)
      .to.have.property(pkg.name)
      .that.have.property('new.version');
    var newVersion = global[pkg.name][pkg.version];
    expect(newVersion).to.have.length(1);
  });
});
