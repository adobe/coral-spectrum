var pkg = require('../../package.json');
var path = require('path');
var dependencyUtils = require('coralui-grunt-componentbuilder/utils/dependency-utils');

// Build a list of files for Karma
// We use a custom list of files here to include source files/tests for all Coral components
var includeOrder = dependencyUtils.getJavascriptPaths(pkg);

// Start with the basic external dependencies
var karmaFiles = [
  'build/js/libs/jquery-message.js',
  'build/js/libs/jquery-validator.js',
  'build/js/libs/moment.js',
  'build/js/libs/toe.js',
];

// Add in the include order from package.json
karmaFiles = karmaFiles.concat(includeOrder);

// Add in the actual tests
karmaFiles.push('build/tests/*.js');

module.exports = {
  options: {
    files: karmaFiles,
    preprocessors: {
      // Instrument the source files we'll be running tests against
      'node_modules/coral*/**/*.js': ['coverage']
    }
  }
};
