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
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-contrib-less');
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
      standalone: {
        files: [
          {
            expand: true,
            flatten: true,
            cwd: '<%= dirs.source %>/',
            src: ['icons.less', 'icons_variables.less', 'standalone.less'],
            dest: '<%= dirs.temp %>/less'
          },
          { // bootstrap dependencies
            expand: true,
            filter: 'isFile',
            cwd: '<%= dirs.modules %>/bootstrap/less/',
            src: ['mixins.less', 'variables.less'],
            dest: '<%= dirs.temp %>/less/externals/bootstrap/'
          },
          { // template for icon-browser
            expand: true,
            cwd: '<%= dirs.tasks %>/fonttmpl/',
            src: ['demo.html'],
            dest: '<%= dirs.temp %>/htmlTemplate/'
          }
        ]
      },
      build: {
        files: [
          {
            expand: true,
            flatten: true,
            cwd: '<%= dirs.source %>/',
            src: ['icons.less', 'icons_variables.less'],
            dest: '<%= dirs.build %>/less'
          },
          {
            expand: true,
            flatten: true,
            cwd: '<%= dirs.temp %>/less/',
            src: ['icons_color.less'],
            dest: '<%= dirs.build %>/less'
          },
          {
            expand: true,
            flatten: true,
            cwd: '<%= dirs.temp %>/less/',
            src: ['AdobeIcons.less'],
            dest: '<%= dirs.build %>/less',
            rename: function (dest, src) {
              return dest + '/icons_mono.less';
            }
          },
          {
            expand: true,
            cwd: '<%= dirs.temp %>/less/',
            src: ['AdobeIcons.html'],
            dest: '<%= dirs.build %>/examples',
            rename: function (dest, src) {
              return dest + '/icon-browser.html';
            }
          }
        ]
      }
    }, // copy

    less: {
      "standalone": {
        options: {
          paths: [  // grunt-contrib-less doesn't support template tags, use dirs instead
            dirs.temp+'/less'
          ]
        },
        files: {
          '<%= dirs.build %>/css/<%= outputFileName %>.css': '<%= dirs.temp %>/less/standalone.less',
        }
      },
      "standalone_min": {
        options: {
          paths: [  // grunt-contrib-less doesn't support template tags, use dirs instead
            dirs.temp+'/less'
          ],
          yuicompress: true
        },
        files: {
          '<%= dirs.build %>/css/<%= outputFileName %>.min.css': '<%= dirs.temp %>/less/standalone.less',
        }
      }
    }, // less

    icons: {
      all: {
        src: [
          '<%= dirs.source %>/icons_color/*.svg'
        ],
        dest: '<%= dirs.temp %>/less/icons_color.less',
        template: '<%= dirs.temp %>/htmlTemplate/icons_color.html',
        prefix: 'icon-'
      }
    }, // icons

    webfont: {
      icons: {
        src: '<%= dirs.source %>/icons/*.svg',
        dest: '<%= dirs.build %>/res/icons',
        destCss: '<%= dirs.temp %>/less',
        options: {
            font: 'AdobeIcons',
            relativeFontPath: '@{icon-font-folder}/',
            template: '<%= dirs.tasks %>/fonttmpl/coral.css',
            htmlDemoTemplate: '<%= dirs.temp %>/htmlTemplate/demo.html',
            htmlDemo: true,
            stylesheet: 'less'
        }
      }
    } // webfont

  });
  // end init config

  // Default
  grunt.task.registerTask('default', [
    'clean',
    'copy:standalone',
    'icons',
    'webfont',
    'less',
    'copy:build'
  ]);
};
