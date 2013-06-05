/*global module:false*/
module.exports = function(grunt) {
  /**
    Build directories
    Any directories used by the build should be defined here
  */
  var dirs = {
    build: 'build',
    modules: 'node_modules',
    shared: 'shared',
    components: 'components'
  };

  grunt.loadTasks('tasks');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-contrib-less');

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

    // Task definitions
    clean: {
      build: '<%= dirs.build %>'
    },

    copy: {
      less_bootstrap: {
        files: [
          {
            expand: true,
            filter: 'isFile',
            cwd: '<%= dirs.modules %>/bootstrap/less/',
            src: ['mixins.less', 'variables.less', 'reset.less'],
            dest: '<%= dirs.build %>/less/externals/bootstrap/'
          }
        ]
      },
      less_cui: {
        files: [
          {
            expand: true,
            cwd: '<%= dirs.shared %>/',
            src: ['*.less'],
            dest: '<%= dirs.build %>/less'
          },
          {
            expand: true,
            flatten: true,
            cwd: '<%= dirs.shared %>/',
            src: ['styles/**.less'],
            dest: '<%= dirs.build %>/less/shared'
          },
          {
            expand: true,
            flatten: true,
            cwd: '<%= dirs.shared %>/',
            src: ['styles/includes/**.less'],
            dest: '<%= dirs.build %>/less/shared/includes'
          },
          {
            expand: true,
            cwd: '<%= dirs.components %>/',
            src: ['components.less'],
            dest: '<%= dirs.build %>/less'
          },
          {
            expand: true,
            flatten: true,
            cwd: '<%= dirs.components %>/',
            src: ['**/styles/**.less'],
            dest: '<%= dirs.build %>/less/components'
          }
        ]
      }
    },

    cssmin: {
      main: {
        files: {
          '<%= dirs.build %>/css/cui.min.css': '<%= dirs.build %>/css/cui.css',
          '<%= dirs.build %>/css/cui-wrapped.min.css': '<%= dirs.build %>/css/cui-wrapped.css'
        }
      }
    },

    less: {
      "cui-wrapped": {
        options: {
          paths: [  // grunt-contrib-less doesn't support template tags, use dirs instead
            dirs.build+'/less/'
          ]
        },
        files: {
          '<%= dirs.build %>/css/cui-wrapped.css': '<%= dirs.build %>/less/cui-wrapped.less'
        }
      },
      "cui": {
        options: {
          paths: [  // grunt-contrib-less doesn't support template tags, use dirs instead
            dirs.build+'/less/'
          ]
        },
        files: {
          '<%= dirs.build %>/css/cui.css': '<%= dirs.build %>/less/cui.less'
        }
      }
    },

    icons: {
      all: {
        src: [
          '<%= dirs.source %>/images/icons_color/*.svg'
        ],
        dest: '<%= dirs.build %>/less/shared/icons_color.less',
        prefix: 'icon-'
      }
    }
  });
  // end init config

  // Partial build for development
  grunt.task.registerTask('partial', [
    'clean',
    'copy',
    'icons',
    'less',
    'cssmin'
  ]);

  // Default task
  grunt.task.registerTask('default', [
    'partial'
  ]);
};
