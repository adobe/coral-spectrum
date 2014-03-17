module.exports = function(grunt) {
  function makeRequireStatement(component) {
    return '@require "'+component+'/build/styl"';
  }

  grunt.registerTask('generate-stylus-includes', 'Generate Stylus index file.', function() {
    var pkg = require('../package.json');

    // Include core first
    var indexStyl = [
      makeRequireStatement('coralui-commons'),
      makeRequireStatement('coralui-core')
    ];

    // Process each dependency
    for (var component in pkg.dependencies) {
      // Include only CoralUI components
      if (component.slice(0,17) === 'coralui-component') {
        indexStyl.push(makeRequireStatement(component));
      }
    }

    // Put includes for index.styl
    grunt.file.write('temp/index.styl', indexStyl.join('\n'));
  });
};
