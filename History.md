## 1.0.0 (2014-10-19)

* Automatic use of `winston`, `bunyan`, `debug` and `log4js` node modules if installed, in that order
* Ability to override `logger` or `loadLogger()` to customize what components log in which way
* Registration on `global` to ensure that a full `node_modules` hierarchy of various `thehelp-log-shim` installs can be customized
