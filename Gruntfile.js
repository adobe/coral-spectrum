/*
 * ADOBE CONFIDENTIAL
 *
 * Copyright 2014 Adobe Systems Incorporated
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
/*global module:false*/
/*global require:false*/
/*global __dirname:false*/
module.exports = function(grunt) {
  'use strict';

  var configOptions = {
    configPath: __dirname + '/grunt_tasks/options/',
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
        styl: 'styl',
        scripts: 'scripts',
        js: 'js',
        resources: 'resources',
        components: 'components',
        examples: 'examples',
        documentation: 'documentation',
        guideResources: 'coralui-guide-resources',
        tests: 'tests',
        temp: 'temp'
      }
    }
  };

  // Read in package.json
  var pkg = grunt.file.readJSON('package.json');

  // auto load package.json 'grunt-*' tasks
  // auto init config using 'tasks/options/*.js' files
  // expose package.json for expansion as <%= package.foo %>
  require('load-grunt-config')(grunt, configOptions);

  grunt.config('coralui-componentbuilder', { options: pkg, default: {} } );
  grunt.config('coralui-releasepackage', pkg);

  // load coraui tasks not picked up by load config matching
  grunt.loadNpmTasks('coralui-grunt-releasepackage');
  grunt.loadNpmTasks('coralui-grunt-testrunner');
  grunt.loadNpmTasks('coralui-grunt-componentbuilder');

  // load local tasks
  grunt.loadTasks('grunt_tasks');

  grunt.task.registerTask('docs-mapping', 'generate-docs-mapping');

  grunt.task.registerTask('build', [
    'coralui-componentbuilder',
    'copy',
    'cssmin'
  ]);

  // Default task
  grunt.task.registerTask('default', [
    'build',
    'cssmetrics',
    'docs-mapping',
    'run-tests'
  ]);

  grunt.task.registerTask('run-remote-tests', function () {
    grunt.option('launch', ['osx_chrome_latest']);
    grunt.task.run('coralui-toplevel-test-remote');
  });

  grunt.task.registerTask('ci', [
    'build',
    'run-remote-tests'
  ]);

  // run tests if desired
  grunt.task.registerTask('run-tests', ['coralui-toplevel-testrunner']);

  // Releases the current package
  grunt.task.registerTask('release', [
    'default',
    'clean:finalbuild',
    'coralui-releasepackage'
  ]);
};
