const fs = require('fs');
const path = require('path');
const istanbul = require('rollup-plugin-istanbul');
const util = require('../helpers/util');

module.exports = function(config) {
  const root = util.getRoot();
  const CWD = process.cwd();
  
  const rollupConfig = require('./rollup.conf.js')({runTests: true});
  
  const preprocessors = {};
  
  // Rollup pre-process
  preprocessors[path.join(CWD, 'src/tests/spec.js')] = ['rollup'];
  
  // Pre-process HTML snippets
  preprocessors[path.join(CWD, 'src/tests/snippets/**/*.html')] = ['html2js'];
  
  // Pre-process snippets of dependencies
  preprocessors[path.join(root, 'coral-*/src/tests/snippets/**/*.html')] = ['html2js'];
  
  rollupConfig.push(istanbul({
    include: util.isTLB() ? path.join(CWD, 'coral-*/src/scripts/*.js') : path.join(CWD, 'src/scripts/*.js')
  }));
  
  config.set({
    preprocessors: preprocessors,
  
    // specify the config for the rollup pre-processor: run babel plugin on the code
    rollupPreprocessor: {
      plugins: rollupConfig,
      output: {
        format: 'iife',
        name: 'Coral'
      }
    },
  
    customLaunchers: {
      FirefoxHeadless: {
        base: 'Firefox',
        flags: [ '-headless' ],
        prefs: {
          // Fixes tabs opened on startup
          'extensions.enabledScopes': 0
        }
      },
    },
  
    // start these browsers
    // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
    browsers: ['ChromeHeadless', 'FirefoxHeadless'],
    
    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['mocha', 'sinon-chai'],
    
    // list of files / patterns to load in the browser
    files: [
      // Load momentJS for date time components
      `${root}/node_modules/moment/moment.js`,
  
      {
        // Load the resources
        pattern: `${CWD}/dist/resources/**/*`,
        watched: false,
        included: false,
        served: true
      },
      
      {
        // Files to be available as window.__html__['FILENAME.html']
        pattern: `${CWD}/src/tests/snippets/**/*.html`,
        watched: true,
        served: true,
        included: true // Include HTML snippets so they are preprocessed
      },
  
      {
        // Files to be available as window.__html__['FILENAME.html']
        pattern: `${root}/coral-*/src/tests/snippets/**/*.html`,
        watched: true,
        served: true,
        included: true // Include HTML snippets so they are preprocessed
      },
      
      {
        // Tests that will be included as executable JS
        pattern: `${CWD}/src/tests/spec.js`,
        watched: false,
        served: true,
        included: true
      }
    ],
    
    // test results reporter to use
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: ['progress', 'mocha', 'coverage-istanbul'],
  
    // Configure the reporter
    coverageIstanbulReporter: {
      dir: `${CWD}/dist/coverage/`,
      combineBrowserReports: true,
      reports: ['lcov', 'text-summary']
    },
  
    html2JsPreprocessor: {
      processPath: function(filePath) {
        let parts = path.dirname(path.normalize(filePath)).split(path.sep);
        const lastFolder = parts.pop();

        if (lastFolder === 'snippets') {
          // Drop the file path completely for snippets
          return path.basename(filePath);
        }

        // Otherwise, include the name of the folder
        return `${lastFolder}/${path.basename(filePath)}`;
      }
    },
    
    // enable / disable colors in the output (reporters and logs)
    colors: true,
    
    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,
  
    // Don't fail if no tests
    failOnEmptyTestSuite: false,
    
    // enable / disable watching file and executing tests whenever any file changes
    background: true,
    autoWatch: true,
    
    // If browser does not capture in given timeout [ms], kill it
    captureTimeout: 20000,
    // report which specs are slower than 500ms
    reportSlowerThan: 500,
  
    client: {
      // Set to true for debugging via e.g console.debug
      captureConsole: false
    }
  });
};
