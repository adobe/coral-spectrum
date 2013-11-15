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

  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-compress');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-less');
  grunt.loadNpmTasks('grunt-css-metrics');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-watch');

  grunt.loadNpmTasks('grunt-mocha');
  grunt.loadNpmTasks('grunt-jsdoc');
  grunt.loadNpmTasks('grunt-shell');

  grunt.loadTasks('tasks');

  /**
   JavaScript file include order
   Add new components to this array _after_ the components they inherit from
  */
  var includeOrder = {
    "cui": [
      // Typekit system
      dirs.build +'/js/source/typekit.js',

      // Class system
      dirs.build +'/js/source/Class.js',

      // Namespace
      dirs.build +'/js/source/CUI.js',

      // Utilities
      dirs.build +'/js/source/CUI.Util.js',

      // jQuery extensions
      dirs.build +'/js/source/CUI.jQuery.js',

      // jQuery position plugin
      dirs.build +'/js/source/externals/jquery-ui/jquery.ui.position.js',
      dirs.build +'/js/source/jquery.ui.position.patch.js',

      // base for widgets
      dirs.build +'/js/source/CUI.Widget.js'
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
      less_bootstrap: { // bootstrap dependencies
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
          { // less
            expand: true,
            filter: 'isFile',
            cwd: '<%= dirs.modules %>/coralui-contrib-icons-base/build/less/',
            src: ['**.less'],
            dest: '<%= dirs.build %>/less/shared/'
          },
          { // font files
            expand: true,
            cwd: '<%= dirs.modules %>/coralui-contrib-icons-base/build/res/',
            src: ['**'],
            dest: '<%= dirs.build %>/res/'
          },
          { // icon-browser
            expand: true,
            cwd: '<%= dirs.modules %>/coralui-contrib-icons-base/build/examples/',
            src: ['icon-browser.html'],
            dest: '<%= dirs.build %>/examples/'
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
            flatten: true,
            cwd: '<%= dirs.components %>/',
            src: ['**/styles/**.less'],
            dest: '<%= dirs.build %>/less/components'
          }
        ]
      },
      js_cui: {
        files: [
          {
            expand: true,
            flatten: true,
            cwd: '<%= dirs.components %>/',
            src: ['**/scripts/**.js'],
            dest: '<%= dirs.build %>/js/source/components'
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

              return dest + '/' + component + '/' + filename;
            }
          },
          {
            expand: true,
            cwd: '<%= dirs.components %>/',
            src: ['**/examples/**.*'],
            dest: '<%= dirs.build %>/examples',
            // rename to remove the "examples" folder from source
            rename: function (dest, src) {
              var srcPath = src.split('/'),
                  component = srcPath[srcPath.length - 3],
                  filename = srcPath[srcPath.length - 1];

              return dest + '/' + component + '/' + filename; 
            }
          }
        ]
      },
      shared: {
        files: [
          {
            expand: true,
            cwd: '<%= dirs.shared %>/examples/',
            src: ['**/*.html'],
            dest: '<%= dirs.build %>/examples',
            rename: function (dest, src) {
              var srcPath = src.split('/'),
                  component = srcPath[srcPath.length - 2],
                  filename = srcPath[srcPath.length - 1];
              return dest  + '/' + component + '/' + filename; 
            }
          }
        ]
      },
      js_jqueryui: {
        files: [
          {
            expand: true,
            filter: 'isFile',
            cwd: '<%= dirs.modules %>/jquery-ui/ui/',
            src: ['jquery.ui.position.js'],
            dest: '<%= dirs.build %>/js/source/externals/jquery-ui/'
          }
        ]
      },
      js_shared: {
        files: [
          {
            expand: true,
            flatten: true,
            cwd: '<%= dirs.shared %>/scripts/',
            src: ['**'],
            dest: '<%= dirs.build %>/js/source/'
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

    generate_imports: {
      output: '@import-once \'components/{filename}\';\n',
      dest: '<%= dirs.build %>/less/components.less',
      core: {
        src: '<%= dirs.components %>/**/styles/*.less'
      }
    },

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

    cssmetrics: {
      core: {
        src: [
          '<%= dirs.build %>/css/cui-core.css',
          '<%= dirs.build %>/css/cui-core.min.css'
        ],
        options: {
          maxSelectors: 4096
        }
      }
    // css metrics
    },

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
                destination: '<%= dirs.build %>/doc'
            }
        }
    }, // jsdoc

    watch: {
        scripts: {
            files: [
                dirs.shared + '/scripts/**.js',
                dirs.tests + '/**/test.*.js',
                dirs.components + '/**/scripts/**.js',
                dirs.components + '/**/tests/**.js'
            ],
            tasks: ['quicktest'],
            options: {
                nospawn: true
            }
        }, // scripts
        styles: {
          files: [
            dirs.components + '/**/styles/**.less',
            dirs.shared + '/styles/**/**.less'
          ],
          tasks: ['quickless'],
          options: {
            nospawn: true
          }
        }, // styles
        html: {
          files: [
            dirs.components + '/**/examples/**.html',
            dirs.shared + '/examples/**/*.html'
          ],
          tasks: ['quickhtml'],
          options: {
            nospawn: true
          }
        } // html
    }, // watch

    compress: {
      publish: {
        options: {
            mode: 'tgz',
            archive: '<%= dirs.build %>/<%= meta.appName %>-<%= meta.version %>.tgz'
        },
        files: [
            {
                expand: true,
                src: [
                    'components/**',
                    'shared/**',
                    'tests/**',
                    'package.json',
                    'README.md'
                ],
                dest: 'package/'
            }
        ]
      }
    },

    "shell": {
      "local-publish": {
        "command": "sh coralui-local-publish <%= meta.appName %> <%= dirs.build %>/<%= meta.appName %>-<%= meta.version %>.tgz",
        "options": {
            stdout: true,
            stderr: true
        }
      },
      "publish": {
        "command": "npm publish <%= dirs.build %>/<%= meta.appName %>-<%= meta.version %>.tgz",
        "options": {
          stderr: true
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
    'concat',
    'uglify',
    'generate-imports',
    'less',
    'cssmin',
    'cssmetrics',
    'mocha'
  ]);

  grunt.task.registerTask('full', [
    'partial',
    'jsdoc'
  ]);

  grunt.task.registerTask('retro', [
    'legacy',
    'partial'
  ]);

  grunt.task.registerTask('quicktest', [
    'jshint', 'copy:tests', 'concat', 'uglify', 'mocha'
  ]);

  grunt.task.registerTask('quickless', [
    'copy:less_cui', 'less', 'cssmin', 'cssmetrics'
  ]);

  grunt.task.registerTask('quickhtml', [
    'copy:res_components', 'copy:shared'
  ]);


  grunt.task.registerTask('publish-build', [
    'retro',
    'compress:publish'
  ]);

  grunt.task.registerTask('publish', [ // publish NPM package
    'publish-build',
    'shell:publish'
  ]);

  grunt.task.registerTask('local-publish', [ // publish NPM package locally
    'publish-build',
    'shell:local-publish'
  ]);

  // Default task
  grunt.task.registerTask('default', [
    'partial'
  ]);
};
