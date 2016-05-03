## 1.0.2 (2016-05-03)

* `winston` now tried second-to-last because `prompt` installs it, so it may be in your `node_modules` directory even if you aren't using it directly. This is due to the new flat directory structure new in `npm@3`.
* `debug` now tried last because `mocha` installs it. And `mocha` is extremely common.

## 1.0.1 (2014-10-19)

* Fix package.json reference to entrypoint file

## 1.0.0 (2014-10-19)

* Automatic use of `winston`, `bunyan`, `debug` and `log4js` node modules if installed, in that order
* Ability to override `logger` or `loadLogger()` to customize what components log in which way
* Registration on `global` to ensure that a full `node_modules` hierarchy of various `thehelp-log-shim` installs can be customized
