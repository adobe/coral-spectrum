/**
 * Copyright 2019 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

const path = require('path');
const istanbul = require('rollup-plugin-istanbul');
const util = require('../helpers/util');

module.exports = function (config) {
  const root = util.getRoot();
  const CWD = process.cwd();

  const rollupConfig = require('./rollup.conf.js')({runTests: true});

  const preprocessors = {};

  const specs = path.join(CWD, 'src/tests/spec.js');
  let snippets;
  let scripts;

  if (util.isTLB()) {
    snippets = path.join(root, 'coral-*/src/tests/snippets/**/*.html');
    scripts = path.join(root, 'coral-*/src/scripts/*.js');
  } else {
    snippets = path.join(CWD, 'src/tests/snippets/**/*.html');
    scripts = path.join(CWD, 'src/scripts/*.js');
  }

  // Rollup pre-process
  preprocessors[specs] = ['rollup'];

  // Pre-process HTML snippets
  preprocessors[snippets] = ['html2js'];

  rollupConfig.push(istanbul({
    include: scripts
  }));

  config.set({
    preprocessors: preprocessors,

    // specify the config for the rollup pre-processor: run babel plugin on the code
    rollupPreprocessor: {
      plugins: rollupConfig,
      output: {
        format: 'iife',
        name: 'Coral',
        sourcemap: 'inline'
      }
    },

    customLaunchers: {
      FirefoxHeadless: {
        base: 'Firefox',
        flags: ['-headless'],
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

    // Adding a proxy to map the icons
    proxies: {
      [path.join('/absolute', CWD, 'dist/resources/')]: path.join(root, 'coral-component-icon/src/resources/')
    },

    // list of files / patterns to load in the browser
    files: [
      // Load momentJS for date time components
      `${root}/node_modules/moment/moment.js`,

      {
        // Load the resources
        pattern: path.join(root, 'coral-component-icon/src/resources/**/*'),
        watched: false,
        included: false,
        served: true
      },

      {
        // Files to be available as window.__html__['FILENAME.html']
        pattern: snippets,
        watched: true,
        served: true,
        included: true // Include HTML snippets so they are preprocessed
      },

      {
        // Tests that will be included as executable JS
        pattern: specs,
        watched: false,
        served: true,
        included: true
      }
    ],

    // test results reporter to use
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: ['mocha', 'coverage-istanbul'],

    // Configure the reporter
    coverageIstanbulReporter: {
      dir: path.join(CWD, 'dist/coverage'),
      combineBrowserReports: true,
      reports: ['lcov', 'text-summary']
    },

    html2JsPreprocessor: {
      processPath: function (filePath) {
        let parts = path.dirname(path.normalize(filePath)).split(path.sep);
        const lastFolder = parts.pop();

        if (lastFolder === 'snippets') {
          // Drop the file path completely for snippets
          return path.basename(filePath);
        }

        // Otherwise, include the name of the folder
        return path.join(lastFolder, path.basename(filePath));
      }
    },

    // enable / disable colors in the output (reporters and logs)
    colors: true,

    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_DEBUG,

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
      /* ,
      // Override the timeout, should tests fail due to timeout errors.
      mocha: {
        timeout: 2500
      } */
    }
  });
};
