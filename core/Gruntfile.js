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
    components: 'components',
    tests: 'tests'
  };

  //grunt.loadTasks('tasks');

  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-less');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-watch');

  grunt.loadNpmTasks('grunt-mocha');
  grunt.loadNpmTasks('grunt-jsdoc');

  /**
   JavaScript file include order
   Add new components to this array _after_ the components they inherit from
  */
  var includeOrder = {
    "cui": [
      // Class system
      dirs.shared +'/scripts/Class.js',

      // Namespace
      dirs.shared +'/scripts/CUI.js',

      // Utilities
      dirs.shared +'/scripts/CUI.Util.js',

      // jQuery extensions
      dirs.shared +'/scripts/CUI.jQuery.js',

      // base for widgets
      dirs.shared +'/scripts/CUI.Widget.js',

      // base for widgets
      dirs.components +'/rail/scripts/CUI.Rail.js'
    ]
  };
  var packages = {
    "cui": [ "cui"]
  };

  /**
    Get array of CUI includes in the correct order

    @param pkg      The package to build
  */
  function getIncludes(pkg) {
    var includes = [ ];
    var def = packages[pkg];
    def.forEach(function(_set) {
      includeOrder[_set].forEach(function(_file) {
        var pref = "{build}";
        var prefLen = pref.length;
        if ((_file.length >= prefLen) && (_file.substring(0, prefLen) === pref)) {
          includes.push(dirs.build + "/js/" + _file.substring(prefLen + 1));
        }
        includes.push(_file);
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
            globals: {
                'jQuery': true,       // jQuery
                'console': true,      // console.log...
                'CUI': true,          // CoralUI
                'Class': true        // Class
            }
        },
        shared: [
            'Gruntfile.js',
            '<%= dirs.shared %>/scripts/**.js',
            '<%= dirs.components %>/**/scripts/**.js'
        ]
    },

    // Task definitions
    clean: {
      build: '<%= dirs.build %>'
    }, // clean

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
      less_icons_base: {
        files: [
          {
            expand: true,
            filter: 'isFile',
            cwd: '<%= dirs.modules %>/coralui-contrib-icons-base/build/less/',
            src: ['**.less'],
            dest: '<%= dirs.build %>/less/shared/'
          },
          {
            expand: true,
            cwd: '<%= dirs.modules %>/coralui-contrib-icons-base/build/res/',
            src: ['**'],
            dest: '<%= dirs.build %>/res/'
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
      },
      res_components: {
        files: [
          {
            expand: true,
            cwd: '<%= dirs.components %>/',
            src: ['**/resources/**.*'],
            dest: '<%= dirs.build %>/res/components',
            // rename to remove the "resources" folder from source
            rename: function (dest, src) {
              var srcPath = src.split('/'),
                  component = srcPath[srcPath.length - 3],
                  filename = srcPath[srcPath.length - 1];

              return dest + '/' + component + '/' + filename; //dest + src.substring(0, src.indexOf('/')) + '.html';
            }
          },
          {
            expand: true,
            cwd: '<%= dirs.components %>/',
            src: ['**/examples/**.*'],
            dest: '<%= dirs.build %>/examples',
            // rename to remove the "resources" folder from source
            rename: function (dest, src) {
              var srcPath = src.split('/'),
                  component = srcPath[srcPath.length - 3],
                  filename = srcPath[srcPath.length - 1];

              return dest + '/' + component + '/' + filename; //dest + src.substring(0, src.indexOf('/')) + '.html';
            }
          }
        ]
      },
      fonts: {
        files: [
          {
            expand: true,
            cwd: '<%= dirs.shared %>/fonts/',
            src: ['**'],
            dest: '<%= dirs.build %>/res/fonts/'
          }
        ]
      },
      tests: {
        files: [ // test cases
          {
            expand: true,
            cwd: '<%= dirs.tests %>/',
            src: ['**'],
            dest: '<%= dirs.build %>/tests'
          },
          { // test cases from components
            expand: true,
            flatten: true,
            cwd: '<%= dirs.components %>/',
            src: ['**/tests/**.js'],
            dest: '<%= dirs.build %>/tests'
          },
          { // testrunner + dependencies
            expand: true,
            cwd: '<%= dirs.modules %>/',
            src: [
              'chai/chai.js',
              'chai-jquery/chai-jquery.js',
              'mocha/mocha.js',
              'mocha/mocha.css'
            ],
            dest: '<%= dirs.build %>/tests/libs'
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
    }, // cssmin

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

    concat: {
      cui: {
        src: getIncludes("cui"),
        dest: '<%= dirs.build %>/js/<%= outputFileName %>.js'
      }
    }, // concat

    uglify: {
      // TBD: minify individual JS files?
      cui: {
        files: {
          // TODO: make it work with reading the configuration option
          '<%= dirs.build %>/js/<%= outputFileName %>.min.js': ['<%= dirs.build %>/js/<%= outputFileName %>.js']
        }
      }
    }, // uglify

    mocha: {
      cui: {
        src: ['<%= dirs.build %>/tests/index.html'],
        options: {
          bail: true,
          log: true,
          run: true
        }
      }
    }, // mocha

    jsdoc : {
        cui : {
            src: ['<%= dirs.shared %>/scripts/**.js', '<%= dirs.components %>/**/scripts/**.js'],
            options: {
                destination: '<%= dirs.build %>/doc',
                template: '../res/docTemplate/'
            }
        }
    }, // jsdoc

    watch: {
        scripts: {
            files: [
                dirs.shared + '/scripts/**.js',
                dirs.components + '/**/scripts/**.js'
            ],
            tasks: ['jshint', 'concat', 'uglify', 'mocha'],
            options: {
                nospawn: true
            }
        }
    } // watch

  });
  // end init config

  // Partial build for development
  grunt.task.registerTask('partial', [
    'clean',
    'jshint',
    'copy',
    'concat',
    'uglify',
    'less',
    'cssmin',
    'mocha'
  ]);

  grunt.task.registerTask('full', [
    'clean',
    'jshint',
    'copy',
    'concat',
    'uglify',
    'less',
    'cssmin',
    'mocha',
    'jsdoc'
  ]);

  // Default task
  grunt.task.registerTask('default', [
    'partial'
  ]);
};
