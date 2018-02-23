/*
 * ADOBE CONFIDENTIAL
 *
 * Copyright 2017 Adobe Systems Incorporated
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of Adobe Systems Incorporated and its suppliers,
 * if any.  The intellectual and technical concepts contained
 * herein are proprietary to Adobe Systems Incorporated and its
 * suppliers and may be covered by U.S. and Foreign Patents,
 * patents in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Adobe Systems Incorporated.
 */

const fs = require('fs');
const path = require('path');
const util = require('../helpers/util');

module.exports = function(config) {
  const packageJSON = util.getPackageJSON();
  const root = util.getRoot();
  const CWD = process.cwd();
  
  const rollupConfig = require('./rollup.conf.js');
  
  const preprocessors = {};
  
  // Rollup pre-process
  preprocessors[path.join(CWD, 'src/tests/index.js')] = ['rollup'];
  
  // Pre-process HTML snippets
  preprocessors[path.join(CWD, 'src/tests/snippets/**/*.html')] = ['html2js'];
  
  // Pre-process snippets of dependencies
  preprocessors[path.join(root, 'coralui-*/src/tests/snippets/**/*.html')] = ['html2js'];
  
  config.set({
    preprocessors: preprocessors,
  
    // specify the config for the rollup pre-processor: run babel plugin on the code
    rollupPreprocessor: {
      format: 'iife',
      plugins: rollupConfig.plugins
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
  
    plugins: [
      require('karma-chrome-launcher'),
      require('karma-firefox-launcher'),
      require('karma-html2js-preprocessor'),
      require('karma-mocha'),
      require('karma-sinon-chai'),
      require('karma-coverage'),
      require('karma-benchmark'),
      require('karma-benchmark-reporter'),
      require('karma-junit-reporter'),
      require('karma-rollup-plugin')
    ],
    
    // list of files / patterns to load in the browser
    files: [
      // Load the theme
      `${CWD}/build/css/coral.css`,
      
      // Load momentJS for date time components
      `${root}/node_modules/moment/moment.js`,
  
      {
        // Load the resources
        pattern: `${CWD}/build/resources/**/*`,
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
        // Test helpers that will be included as executable JS
        pattern: `${root}/coralui-*/src/tests/helpers/*.js`,
        watched: true,
        served: true,
        included: true // Include testing helpers
      },
  
      {
        // Files to be available as window.__html__['FILENAME.html']
        pattern: `${root}/coralui-*/src/tests/snippets/**/*.html`,
        watched: true,
        served: true,
        included: true // Include HTML snippets so they are preprocessed
      },
  
      {
        // Test helpers that will be included as executable JS
        pattern: `${CWD}/src/tests/helpers/*.js`,
        watched: true,
        served: true,
        included: true // Include testing helpers
      },
      
      {
        // Tests that will be included as executable JS
        pattern: `${CWD}/src/tests/index.js`,
        watched: true,
        served: true,
        included: true // Include testing helpers
      }
    ],
    
    // test results reporter to use
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: ['junit', 'progress', 'coverage'],
  
    junitReporter: {
      outputDir: `${CWD}/build/reports`,
      outputFile: 'tests.xml',
      useBrowserName: true,
      classNameFormatter: function(browser, result) {
        return result.suite[0];
      },
      nameFormatter: function(browser, result) {
        let suite = result.suite;
        if (suite.length > 1) {
          suite = suite.slice(1);
        }
        return suite.join(' ') + ' ' + result.description;
      },
      properties: {
        'module.name': packageJSON.name,
        'module.version': packageJSON.version,
        // Jenkins environment variables:
        'build.url': process.env.BUILD_URL,
        'job.name': process.env.JOB_NAME,
        'git.commit': process.env.GIT_PREVIOUS_SUCCESSFUL_COMMIT,
        'git.branch': process.env.GIT_BRANCH,
        'git.url': process.env.GIT_URL
      }
    },
  
    // Configure the reporter
    coverageReporter: {
      type: 'lcov',
      dir: `${CWD}/build/coverage/`
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
    reportSlowerThan: 500
  });
};
