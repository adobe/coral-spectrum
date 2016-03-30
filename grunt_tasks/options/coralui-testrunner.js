var dependencyUtils = require('coralui-util-dependencies');

// Build a list of files for Karma
// We have to rebuild the default file set here
// because we're grabbing tests copied from node_modules to build
var includeOrder = dependencyUtils.getJavascriptPaths('.');

// Start with the basic external dependencies
var karmaFiles = [
  'build/js/libs/moment.js',
  'build/css/coral.css', // Include CSS so tests based on styles work
  'build/js/Coral.strings.js' // Include localized strings
];

// Add in the include order from package.json
karmaFiles = karmaFiles.concat(includeOrder);

// Add in the actual tests
karmaFiles = karmaFiles.concat([
  {
    pattern: 'build/resources/**',
    watched: false,
    served: true,
    included: false
  },
  {
    // Files to be available as window.__html__['base/build/tests/snippets/FILENAME.html']
    // Note: stripPathFromSnippets.js will change this to window.__html__['FILENAME.html']
    pattern: 'build/tests/snippets/**/*.html',
    watched: true,
    served: true,
    included: true // Include HTML snippets so they are preprocessed
  },
  {
    // Test helpers that will be included as executable JS
    pattern: 'build/tests/helpers/**/*.js',
    watched: true,
    served: true,
    included: true // Include testing helpers
  },
  {
    // Test fixtures to be served under /base/build/tests/fixtures/
    pattern: 'build/tests/fixtures/**/*',
    watched: true,
    served: true,
    included: false // Don't include non-executable files
  },

  // Remove the paths from snippet names under __html__
  'node_modules/coralui-grunt-testrunner/lib/stripPathFromSnippets.js',

  'build/tests/*.js',
]);

module.exports = {
  options: {
    files: karmaFiles,
    frameworks: [
      'mocha',
      'chai-jquery',
      'jquery-2.1.0', // This will need to be updated when jQuery's version is incremented
      'chai-sinon'
    ],
    // top level also needs to tweak pre-processor paths
    preprocessors: {
      // Pre-process HTML snippets
      'build/tests/snippets/**/*.html': ['html2js'],

      // coverage is taken from scripts after change introduced by CUI-3045 in coralui-util-dependencies. there's no
      // need to exclude anything else
      'node_modules/coralui-*/scripts/**/*.js': ['coverage']
    }
  }
};
