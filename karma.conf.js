const path = require('path');
const alias = require('@rollup/plugin-alias');
const { default: nodeResolve } = require('@rollup/plugin-node-resolve');
const commonjs = require('@rollup/plugin-commonjs');
const istanbul = require('rollup-plugin-istanbul');
const { default: babel } = require('@rollup/plugin-babel');
const minimist = require('minimist');
const c = require('ansi-colors');
const argv = minimist(process.argv.slice(2));

var coverage = String(process.env.COVERAGE) === 'true',
  ci = String(process.env.CI).match(/^(1|true)$/gi),
  pullRequest = !String(process.env.TRAVIS_PULL_REQUEST).match(/^(0|false|undefined)$/gi),
  mainBranch = String(process.env.TRAVIS_BRANCH).match(/^main$/gi),
  sauceLabs = ci && !pullRequest && mainBranch;

var sauceLabsLaunchers = {
  sl_chrome: {
    base: 'SauceLabs',
    browserName: 'chrome',
    browserVersion: '98',
    platform: 'Windows 10'
  },
  sl_firefox: {
    base: 'SauceLabs',
    browserName: 'firefox',
    platform: 'Windows 10'
  },
  sl_safari: {
    base: 'SauceLabs',
    browserName: 'safari',
    platform: 'macOS 10.13'
  },
  sl_edge: {
    base: 'SauceLabs',
    browserName: 'MicrosoftEdge',
    browserVersion: '98',
    platform: 'Windows 10'
  }
};

module.exports = function(config) {
  config.set({
    browsers: sauceLabs
      ? Object.keys(sauceLabsLaunchers)
      : ['FirefoxHeadless'],

    customLaunchers: sauceLabs ? sauceLabsLaunchers : undefined,

    sauceLabs: {
      build: 'CI #' + process.env.TRAVIS_BUILD_NUMBER + ' (' + process.env.TRAVIS_BUILD_ID + ')',
      tunnelIdentifier: process.env.TRAVIS_JOB_NUMBER || ('local'+require('./package.json').version),
      connectLocationForSERelay: 'localhost',
      connectPortForSERelay: 4445,
      startConnect: false
    },

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
      coverage ? 'coverage' : [],
      sauceLabs ? 'saucelabs' : []
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
      'https://polyfill.io/v3/polyfill.min.js?features=Element.prototype.dataset%2CArray.from',
      {
        pattern: config.grep || 'src*/**/test.js',
        watched: false
      },
    ],

    preprocessors: {
      'src*/**/test.js': ['rollup']
    },

    rollupPreprocessor: {
      output: {
        format: 'iife', // Helps prevent naming collisions.
        name: 'sinuousTest', // Required for 'iife' format.
        sourcemap: 'inline' // Sensible for testing.
      },
      preserveSymlinks: true,
      plugins: [
        require('karma-firefox-launcher'),
        alias({
          entries: {
            tape: 'tape-browser',
            'sinuous/h': __dirname + '/src/h/src/index.js',
            'sinuous/htm': __dirname + '/src/htm/src/index.js',
            'sinuous/observable': __dirname + '/src/observable/src/observable.js',
            'sinuous/template': __dirname + '/src/template/src/template.js',
            'sinuous/data': __dirname + '/src/data/src/data.js',
            'sinuous/render': __dirname + '/src/render/src/index.js',
            'sinuous/hydrate': __dirname + '/src/hydrate/src/index.js',
            'sinuous/map': __dirname + '/src/map/src/index.js',
            'sinuous': __dirname + '/src/src/index.js'
          }
        }),
        nodeResolve(),
        commonjs(),
        istanbul({
          include: config.grep ?
            config.grep.replace('/test/', '/src/') :
            '*/!(htm)/**/src/**/*.js'
        }),
        sauceLabs && babel({
          babelHelpers: 'bundled',
          inputSourceMap: false,
          compact: false,
          include: [
            'src/**'
          ]
        })
      ].filter(Boolean),
      onwarn: (msg) => /eval/.test(msg) && void 0
    }
  });
};
