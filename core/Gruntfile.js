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
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-less');
  grunt.loadNpmTasks('grunt-contrib-uglify');

  /**
   JavaScript file include order
   Add new components to this array _after_ the components they inherit from
  */
  var includeOrder = {
    "cui": [
      // Class system
      'Class.js',

      // Namespace
      'CUI.js',

      // Utilities
      'CUI.Util.js',

      // jQuery extensions
      'CUI.jQuery.js',

      // base for widgets
      'CUI.Widget.js'
    ]
  };
  var packages = {
    "cui": [ "cui"]
  };

  /**
    Get array of CUI includes in the correct order

    @param pkg      The package to build
    @param jsPath   Base path to prepend to each include
  */
  function getIncludes(pkg, jsPath) {
    var includes = [ ];
    var def = packages[pkg];
    def.forEach(function(_set) {
      includeOrder[_set].forEach(function(_file) {
        var pref = "{build}";
        var prefLen = pref.length;
        if ((_file.length >= prefLen) && (_file.substring(0, prefLen) === pref)) {
          includes.push(dirs.build + "/js/" + _file.substring(prefLen + 1));
        }
        includes.push(jsPath + _file);
      });
    });
    return includes;
  }

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
    outputFileName: "cui-core",

    // Configuration
    jshint: {
      options: {
        eqeqeq: true,
        immed: true,
        latedef: true,
        newcap: true,
        noarg: true,
        sub: true,
        undef: true,
        boss: true,
        eqnull: true,
        browser: true,
        smarttabs: true,
        predef: [
          '$',            // jQuery
          'jQuery',       // jQuery
          'console',      // console.log...
          'Backbone',     // Backbone
          'Handlebars',   // Handlebars
          'prettyPrint',  // google-code-prettify
          'CUI',          // CoralUI
          'Class',        // Class
          'moment'        // Moment.js
        ]
      },
      globals: {}
    },

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
            flatten: true,
            cwd: '<%= dirs.shared %>/',
            src: ['styles/base/**.less'],
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
    }, // copy

    cssmin: {
      main: {
        files: {
          '<%= dirs.build %>/css/<%= outputFileName %>.min.css': '<%= dirs.build %>/css/<%= outputFileName %>.css',
          '<%= dirs.build %>/css/<%= outputFileName %>-wrapped.min.css': '<%= dirs.build %>/css/<%= outputFileName %>-wrapped.css'
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
          '<%= dirs.build %>/css/<%= outputFileName %>-wrapped.css': '<%= dirs.build %>/less/cui-wrapped.less'
        }
      },
      "cui": {
        options: {
          paths: [  // grunt-contrib-less doesn't support template tags, use dirs instead
            dirs.build+'/less/'
          ]
        },
        files: {
          '<%= dirs.build %>/css/<%= outputFileName %>.css': '<%= dirs.build %>/less/cui.less'
        }
      }
    }, // less

    icons: {
      all: {
        src: [
          '<%= dirs.source %>/images/icons_color/*.svg'
        ],
        dest: '<%= dirs.build %>/less/shared/icons_color.less',
        prefix: 'icon-'
      }
    },

    lint: {
      files: [
        'Gruntfile.js',
        '<%= dirs.shared %>/scripts/*.js'
      ]
    },

    concat: {
      cui: {
        src: getIncludes("cui", dirs.shared +'/scripts/'),
        dest: '<%= dirs.build %>/js/<%= outputFileName %>.js'
      }
    },

    uglify: {
      // TBD: minify individual JS files?
      cui: {
        files: {
          // TODO: make it work with reading the configuration option
          '<%= dirs.build %>/js/<%= outputFileName %>.min.js': ['<%= dirs.build %>/js/<%= outputFileName %>.js']
        }
      }
    }
  });
  // end init config

  // Partial build for development
  grunt.task.registerTask('partial', [
    'clean',
    'jshint',
    'copy',
    'icons',
    'concat',
    'uglify',
    'less',
    'cssmin'
  ]);

  // Default task
  grunt.task.registerTask('default', [
    'partial'
  ]);
};
