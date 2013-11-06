/*global module:false*/
module.exports = function(grunt) {
  /**
    Build directories
    Any directories used by the build should be defined here
  */
  var dirs = {
    build: 'build',
    source: 'source',
    temp: 'temp',
    modules: 'node_modules',
    tasks: 'tasks'
  };

  grunt.loadTasks('tasks');

  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-webfont');

  // Read in package.json
  var pkg = grunt.file.readJSON('package.json');

  // Meta and build configuration
  var meta = {
      version: pkg.version,
      appName: pkg.name,
      appWebSite: pkg.repository.url
  };

  grunt.initConfig({

    dirs: dirs,
    meta: meta,
    outputFileName: "icons",

    // Task definitions
    clean: {
      build: '<%= dirs.build %>',
      temp: '<%= dirs.temp %>'
    }, // clean

    copy: {
      template: {
        files: [
          { // template for icon-browser
            expand: true,
            cwd: '<%= dirs.tasks %>/fonttmpl/',
            src: ['demo.html'],
            dest: '<%= dirs.temp %>/htmlTemplate/'
          }
        ]
      },
      icons_athena: {
        files: [
          { // monochrome icons
            expand: true,
            filter: 'isFile',
            cwd: '<%= dirs.modules %>/coralui-contrib-icons-athena/build/monochrome/24/',
            src: ['**.svg'],
            dest: '<%= dirs.temp %>/monochrome/24/'
          }
        ]
      }
    }, // copy

    webfont: {
      icons: {
        src: '<%= dirs.temp %>/monochrome/24/*.svg',
        dest: '<%= dirs.build %>/font',
        destCss: '<%= dirs.build %>/less',
        options: {
            font: 'AdobeIcons',
            relativeFontPath: '@{icon-font-folder}/',
            template: '<%= dirs.tasks %>/fonttmpl/coral.css',
            htmlDemoTemplate: '<%= dirs.temp %>/htmlTemplate/demo.html',
            htmlDemo: true,
            destHtml: '<%= dirs.build %>/html',
            stylesheet: 'less'
        }
      }
    } // webfont

  });
  // end init config

  // Default
  grunt.task.registerTask('default', [
    'clean',
    'import-addon',
    'copy:template',
    'copy:icons_athena',
    'webfont'
  ]);
};
