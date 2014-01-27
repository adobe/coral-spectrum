module.exports = function(grunt) {

  grunt.registerTask('concat-scripts', "Concatenate JavaScript files used for build of CoralUI", function() {
    var config = getConcatConfig();
    grunt.log.writeln ('Concatenate config:', config);
    grunt.config.set('concat.coralui', config);
    grunt.task.run("concat");
  });

  function getConcatConfig() {

    var config = {},
    dirs = grunt.config('dirs');
    package = grunt.config('package');

    config["dest"] = dirs.build + '/' + dirs.js + '/coral.js';
    config["src"] = [];

    // file path pulled directly from package.json
    package.coral.order.scripts.forEach( function(filePath) {
      var sourcePath = dirs.modules + '/' + filePath;
      grunt.verbose.writeln("Adding", sourcePath);
      config.src.push(sourcePath);
    });

    return config;
  }
}
