var dependencyUtils = require('coralui-util-dependencies');

// Build a list of files for Karma
// We use a custom list of files here to include source files/tests for all Coral components
var includeOrder = dependencyUtils.getJavascriptPaths('.');

// Start with the basic external dependencies
var karmaFiles = [
  'build/js/libs/jquery-message.js',
  'build/js/libs/jquery-validator.js',
  'build/js/libs/moment.js',
  'build/js/libs/toe.js'
];

// Add in the include order from package.json
karmaFiles = karmaFiles.concat(includeOrder);

// Add in the actual tests
karmaFiles = karmaFiles.concat([
  'build/tests/*.js',
  { pattern: 'build/tests/fixtures/**', watched: true, served: true, included: false }
]);

module.exports = {
  options: {
    files: karmaFiles,
    preprocessors: {
      // Instrument the source files we'll be running tests against
      // Only include files in the build output
      'node_modules/coralui-core/build/js/*.js': ['coverage'],
      'node_modules/coralui-component-*/build/js/*.js': ['coverage']
    }
  }
};
