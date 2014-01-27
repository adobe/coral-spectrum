module.exports = function(grunt) {

  var config = grunt.config.get();

  grunt.registerTask('compile-css', "Compiles stylus into the css for CoralUI", function() {

    var tasks = [];

    grunt.task.run('generate-stylus-includes');
    grunt.task.run('stylus');
    grunt.task.run('cssmin');
  });
}
