const path = require('path');
const alias = require('@rollup/plugin-alias');
const { default: nodeResolve } = require('@rollup/plugin-node-resolve');
const commonjs = require('@rollup/plugin-commonjs');
const istanbul = require('rollup-plugin-istanbul');
const minimist = require('minimist');
const c = require('ansi-colors');
const argv = minimist(process.argv.slice(2));

var coverage = String(process.env.COVERAGE) === 'true';

module.exports = function(config) {
  config.set({
    browsers: ['FirefoxHeadless'],

    // browserLogOptions: { terminal: true },
    // browserConsoleLogOptions: { terminal: true },
    browserConsoleLogOptions: {
      level: 'warn', // Filter on warn messages.
      format: '%b %T: %m',
      terminal: true
    },

    browserNoActivityTimeout: 60 * 60 * 1000,

    // Use only one browser, works better with open source Sauce Labs remote testing
    // concurrency: 1,

    captureTimeout: 0,

    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_DISABLE,

    client: { captureConsole: !!argv.console },

    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: ['tap-pretty'].concat(
      coverage ? 'coverage' : []
    ),

    tapReporter: {
      prettify: require('faucet') // require('tap-spec')
    },

    formatError(msg) {
      msg = msg.replace(/\([^<]+/gm, '');
      msg = msg.replace(/(\bat\s.*)/gms, argv.stack ? c.dim('$1') : '');
      return msg;
    },

    coverageReporter: {
      dir: path.join(__dirname, 'coverage'),
      reporters: [
        { type: 'text' },
        { type: 'html' },
        { type: 'lcovonly', subdir: '.', file: 'lcov.info' }
      ]
    },

    frameworks: ['tap'],

    files: [
      {
        pattern: config.grep || 'test/test.js',
        watched: false
      },
    ],

    preprocessors: {
      'test/test.js': ['rollup']
    },

    rollupPreprocessor: {
      output: {
        format: 'iife', // Helps prevent naming collisions.
        name: 'sinuousTest', // Required for 'iife' format.
        sourcemap: 'inline' // Sensible for testing.
      },
      preserveSymlinks: true,
      plugins: [
        alias({
          entries: {
            tape: 'tape-browser',
            'sinuous/h': __dirname + '/src/h.js',
            'sinuous/htm': __dirname + '/src/htm.js',
            'sinuous/observable': __dirname + '/src/observable.js',
            'sinuous/template': __dirname + '/src/template.js',
            'sinuous/hydrate': __dirname + '/src/hydrate.js',
            'sinuous/map': __dirname + '/src/map.js',
            'sinuous': __dirname + '/src/index.js'
          }
        }),
        nodeResolve(),
        commonjs(),
        istanbul({
          include: config.grep ?
            config.grep.replace('/test/', '/src/') :
            '*/!(htm)/**/src/**/*.js'
        }),
      ].filter(Boolean),
      onwarn: (msg) => /eval/.test(msg) && void 0
    }
  });
};
