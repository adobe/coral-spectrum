module.exports = function(grunt) {
  // Exclude core, we'll manually put it first
  var excludedRE = /(coralui-core|coralui-commons)/;

  function makeRequireStatement(filePath) {
    return '@require "'+filePath+'"';
  }

  grunt.registerTask('generate-stylus-includes', 'Generate Stylus Index file.', function() {
    // List node_modules
    var files = grunt.file.expand(
      {
        cwd: './node_modules/'
      },
      'coralui-*/build/styl'  // TODO: Make this go off package.json dependencies, in case extras are in node-modules
    );

    // Include core first
    var indexStyl = [
      makeRequireStatement('coralui-commons/build/styl'),
      makeRequireStatement('coralui-core/build/styl')
    ];

    // Run through all folders
    files.forEach(function(filePath) {
      // Ignore excluded paths
      // These are either not required or put first
      if (filePath.match(excludedRE)) {
        return;
      }

      indexStyl.push(makeRequireStatement(filePath));
    });

    // Put includes for index.styl
    grunt.file.write('temp/index.styl', indexStyl.join('\n'));
  });
};
