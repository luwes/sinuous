// Karma configuration
// Generated on Fri Jan 18 2019 07:34:40 GMT-0500 (Eastern Standard Time)

const path = require('path');
const nodeResolve = require('rollup-plugin-node-resolve');
const commonjs = require('rollup-plugin-commonjs');
const istanbul = require('rollup-plugin-istanbul');
const alias = require('rollup-plugin-alias');
const babel = require('rollup-plugin-babel');
const tapSpec = require('tap-spec');

var coverage = String(process.env.COVERAGE) === 'true',
  ci = String(process.env.CI).match(/^(1|true)$/gi),
  pullRequest = !String(process.env.TRAVIS_PULL_REQUEST).match(/^(0|false|undefined)$/gi),
  masterBranch = String(process.env.TRAVIS_BRANCH).match(/^master$/gi),
  sauceLabs = ci && !pullRequest && masterBranch;

var sauceLabsLaunchers = {
  sl_chrome: {
    base: 'SauceLabs',
    browserName: 'chrome',
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
    platform: 'OS X 10.11'
  },
  sl_edge: {
    base: 'SauceLabs',
    browserName: 'MicrosoftEdge',
    platform: 'Windows 10'
  },
  // sl_ie_11: {
  //   base: 'SauceLabs',
  //   browserName: 'internet explorer',
  //   version: '11.0',
  //   platform: 'Windows 7'
  // }
};

var localLaunchers = {
  ChromeNoSandboxHeadless: {
    base: 'Chrome',
    flags: [
      '--no-sandbox',
      // See https://chromium.googlesource.com/chromium/src/+/lkgr/headless/README.md
      '--headless',
      '--disable-gpu',
      // Without a remote debugging port, Google Chrome exits immediately.
      '--remote-debugging-port=9333'
    ]
  }
};

module.exports = function(config) {
  config.set({
    browsers: sauceLabs
      ? Object.keys(sauceLabsLaunchers)
      : Object.keys(localLaunchers),

    customLaunchers: sauceLabs ? sauceLabsLaunchers : localLaunchers,

    sauceLabs: {
      build: 'CI #' + process.env.TRAVIS_BUILD_NUMBER + ' (' + process.env.TRAVIS_BUILD_ID + ')',
      tunnelIdentifier: process.env.TRAVIS_JOB_NUMBER || ('local'+require('./package.json').version),
      connectLocationForSERelay: 'localhost',
      connectPortForSERelay: 4445,
      startConnect: false
    },

    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: ['tap-pretty'].concat(
      coverage ? 'coverage' : [],
      sauceLabs ? 'saucelabs' : []
    ),

    tapReporter: {
      prettify: require('faucet') // tapSpec
    },

    coverageReporter: {
      dir: path.join(__dirname, 'coverage'),
      reporters: [
        { type: 'text-summary' },
        { type: 'html' },
        { type: 'lcovonly', subdir: '.', file: 'lcov.info' }
      ]
    },

    browserLogOptions: { terminal: true },
    browserConsoleLogOptions: { terminal: true },
    // browserConsoleLogOptions: {
    //   level: 'debug',
    //   format: '%b %T: %m',
    //   terminal: false
    // },

    browserNoActivityTimeout: 60 * 60 * 1000,

    // Use only one browser, works better with open source Sauce Labs remote testing
    concurrency: 1,

    captureTimeout: 0,

    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    // logLevel: config.LOG_ERROR,

    // client: { captureConsole: false },

    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['tap', 'sinon'],

    // list of files / patterns to load in the browser
    files: [
      {
        pattern: config.grep || 'packages/sinuous*/**/test.js',
        watched: false
      },
    ],

    // list of files / patterns to exclude
    // exclude: [
    // ],

    // preprocess matching files before serving them to the browser
    // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
    preprocessors: {
      'packages/sinuous*/**/test.js': ['rollup']
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
          'sinuous/observable': __dirname + '/packages/sinuous/observable/src/observable.js',
          'sinuous/each': __dirname + '/packages/sinuous/each/src/each.js',
          'tape': __dirname + '/scripts/tape/dist.js',
          'sinuous': __dirname + '/packages/sinuous/src/index.js',
        }),
        nodeResolve(),
        commonjs(),
        istanbul({
          include: config.grep ?
            config.grep.replace('/test/', '/src/') :
            'packages/**/src/**/*.js'
        })
      ].filter(Boolean),
      onwarn: (msg) => /eval/.test(msg) && void 0
    }
  });
};
