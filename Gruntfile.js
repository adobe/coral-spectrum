/*global module:false*/
module.exports = function(grunt) {

  var configOptions = {
    configPath: process.cwd() + '/grunt_tasks/options/',
    // additional data for configuations
    config: {
      // build system directory constants
      dirs: {
        build: 'build',
        modules: 'node_modules',
        packages: 'packages',
        shared: 'shared',
        css: 'css',
        styles: 'styles',
        scripts: 'scripts',
        js: 'js',
        components: 'components',
        tests: 'tests'
      }
    }
  }

  // auto load package.json 'grunt-*' tasks
  // auto init config using 'tasks/options/*.js' files
  // expose package.json for expansion as <%= package.foo %>
  require('load-grunt-config')(grunt, configOptions);

  // load coraui tasks not picked up by load config matching
  grunt.loadNpmTasks('coralui-grunt-testrunner');

  // load local tasks
  grunt.loadTasks('grunt_tasks');


  grunt.task.registerTask('dev', [ // task for developers to work
    'connect',
    'watch'
  ]);


  // performs the subgrunt task to compile every component dependance
  grunt.task.registerTask('full', ['build-dependencies', 'default']);

  // Default task
  grunt.task.registerTask('default', ['clean', 'copy', 'compile-css', 'concat-scripts', 'uglify']);

  // run tests if desired
  grunt.task.registerTask('run-tests', ['coralui-testrunner']);


};
