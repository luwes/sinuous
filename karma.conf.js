// Karma configuration
// Generated on Fri Jan 18 2019 07:34:40 GMT-0500 (Eastern Standard Time)

const nodeResolve = require('rollup-plugin-node-resolve');
const commonjs = require('rollup-plugin-commonjs');
const istanbul = require('rollup-plugin-istanbul');
const alias = require('rollup-plugin-alias');
const tapSpec = require('tap-spec');

process.env.CHROME_BIN = require('puppeteer').executablePath();

module.exports = function(config) {
  config.set({
    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: true,

    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: false,

    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: '',

    // start these browsers
    // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
    browsers: ['ChromeCustom'],

    browserLogOptions: {
      terminal: true
    },
    browserConsoleLogOptions: {
      terminal: true
    },
    // browserConsoleLogOptions: {
    //   level: 'debug',
    //   format: '%b %T: %m',
    //   terminal: false
    // },

    browserNoActivityTimeout: 60 * 60 * 1000,

    captureTimeout: 0,

    // enable / disable colors in the output (reporters and logs)
    colors: true,

    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_ERROR,

    // client: { captureConsole: false },

    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['tap', 'sinon'],

    // list of files / patterns to load in the browser
    files: [
      {
        pattern: config.grep || 'packages/sinuous*/**/test.js',
        type: 'module',
        watched: false
      },
    ],

    // list of files / patterns to exclude
    exclude: [
    ],

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
      ],
      onwarn: (msg) => /eval/.test(msg) && void 0
    },

    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: ['tap-pretty', 'coverage'],

    tapReporter: {
      prettify: require('faucet') // tapSpec
    },

    coverageReporter: {
      reporters: [{ type: 'text' }, { type: 'lcov' }]
    },

    // web server port
    port: 9876,

    customLaunchers: {
      ChromeCustom: {
        base: 'ChromeHeadless',
        options: {
          settings: {
            webSecurityEnabled: false
          }
        },
        flags: [
          '--headless',
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-gpu',
          '--disable-web-security',
          '--disable-translate',
          '--disable-extensions',
          '--remote-debugging-port=9223'
        ],
        debug: true
      }
    }
  });
};
