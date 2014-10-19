# thehelp-log-shim

Allowing libaries to participate in logging without dictating anything about that logging system.


## Features

* Libraries can be logging-agnostic, just call `verbose`, `info`, `warn` and `error` on the returned `logger` objects.
* By default, these four logging libraries will be tried, in order:
  1. [`winston`](https://github.com/flatiron/winston) (0.7.x and 0.8.x compatibility tested)
  2. [`bunyan`](https://github.com/trentm/node-bunyan) (`verbose` is mapped to its `debug` level)
  3. [`debug`](https://github.com/visionmedia/debug)
  4. [`log4js`](https://github.com/nomiddlename/log4js-node) (`verbose` mapped to its `debug` level)
* Library consumers can customize a library's logging system by overriding:
  * `logger` - to provided a custom static logger object
  * `loadLogger(moduleName)` - for dynamic, per-module logger generation
* If a library isn't using the same version of `thehelp-log-shim` that you have installed, you can use `getAllVersions()` to get access to all versions of this package loaded in your process


## Setup

First install the project as a dependency:

```bash
npm install thehelp-log-shim --save
```

Then start using it:

```javascript
var logShim = require('thehelp-log-shim');
var logger = logShim('my-module-name');

logger.info('blah');
```

If no logging system is installed, that `logger.info()` call will do nothing. Install one of the four logging systems supported by default, and that call will automatically use it.


## Additional configuration

The first level of configuration is by providing your own `logger` object:

```javascript
var logShim = require('thehelp-log-shim');
logShim.logger = {
  error: function(item) {
    console.error('error:', item);
  },
  warn: function(item) {
    console.warn('warn:', item);
  }
};

var logger = logShim('my-module-name');
logger.info('info message');
logger.warn('something is flaky!');
```

The `logger.info()` call will do nothing, and the `warn()` call will be piped through your function to `console.warn`.

_Note: Notice that the provided `logger` only specified two levels, but the code calls `info()`. `thehelp-log-shim` will ensure that all levels are present on any `logger` it provides._


### Dynamic loggers

Now let's get a little more advanced. You have a number of modules, and you want to do different things for each of them:

```javascript
var logShim = require('thehelp-log-shim');
logShim.loadLogger = function(moduleName) {
  if (moduleName === 'left')) {
    return {
      verbose: console.log,
      info: console.log,
      warn: console.log,
      error: console.error
    }
  }
};

var left = logShim('left');
var right = logShim('right');

// prints to console
left.warn('warning!');

// does nothing
right.warn('warning!');
```

Since we're looking at `moduleName` in our `loadLogger()` override, the two `logShim()` calls result in different behavior. It's okay to return null or a half-constructed object - we'll fill in the rest.


### Multi-install, multi-version

Okay, now you're using a few different libraries, all of which use `thehelp-log-shim`. Things are easy as long as you're okay with them all jumping in on the first logging system they find.

Things get interesting when you want to hook in for deeper behavior. `npm` is a very flexible system, so you might have multiple versions of `thehelp-log-shim` installed in the tree of modules under your `node_modules` directory.

Time to write some code:

```javascript
var logShim = require('thehelp-log-shim');

// how many are installed?
console.log(logShim.countInstalled());

// this is an array of string versions
var versions = logShim.getAllVersions();

// set all versions to one logger object
versions.forEach(function(version) {
  logShim.applyToVersion(version, function() {
    logShim.logger = myCustomLogger;
  });
});
```

Of course, this is a bit dangerous as it doesn't take into account the differences of all the various versions. But it will get you started.


## A note to library writers

Always include some sort of post-`require()` configuration option!

You'll remove your users' ability to do more complex customization of `thehelp-log-shim` if you load everything up on initial `require()` of your library. In that case, you'll load up your version of `thehelp-log-shim`, get your `logger` object, then move on before your users have a chance to inject themselves.


## Some logger-specific notes:


### Winston

Because each module will be using a named logger from the default container (via `winston.loggers.get(moduleName)`), you'll need to do a little more work to set the default transports.

For example, this is how you might share the console transport between default container loggers as well as the default top-level logger (direct `winston.info()` calls):

```javascript
var options = {
  colorize: true,
  timestamp: function() {
    var date = new Date();
    return date.toJSON();
  },
  level: 'verbose'
};
var transport = new winston.transports.Console(options);

// configure default transports for all loggers in default container
winston.loggers.options.transports = [transport];

// configure the top level default logger
var instantiatedAlready = true;
winston.remove(winston.transports.Console);
winston.add(transport, null, instantiatedAlready);
```


## Detailed Documentation

Detailed docs be found at this project's GitHub Pages, thanks to [`groc`](https://github.com/nevir/groc): <http://thehelp.github.io/log-shim/src/server/log_shim.html>


## Contributing changes

When you have some changes ready, please submit a pull request with:

* Justification - why is this change worthwhile? Link to issues, use code samples, etc.
* Documentation changes for your code updates. Be sure to check the groc-generated HTML with `grunt doc`
* A description of how you tested the change. Don't forget about the very-useful `npm link` command :0)

I may ask you to use a `git rebase` to ensure that your commits are not interleaved with commits already in the history. And of course, make sure `grunt` completes successfully (take a look at the requirements for [`thehelp-project`](https://github.com/thehelp/project)). :0)


## License

(The MIT License)

Copyright (c) 2014 Scott Nonnenberg &lt;scott@nonnenberg.com&gt;

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
'Software'), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
