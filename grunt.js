/*global module:false*/
module.exports = function(grunt) {
  /**
   JavaScript file include order
   Add new components to this array _after_ the components they inherit from
  */
  var includeOrder = {
    "cui-templates": [
      '{build}/CUI.Templates.js'
    ],
    "cui": [
      // Class system
      'Class.js',

      // Namespace
      'CUI.js',

      // Utilities
      'CUI.Util.js',

      // Components
      'components/CUI.Widget.js',
      'components/CUI.Modal.js',
      'components/CUI.Tabs.js',
      'components/CUI.Alert.js',
      'components/CUI.Rail.js',
      'components/CUI.Popover.js',
      'components/CUI.DropdownList.js',
      'components/CUI.Dropdown.js',
      'components/CUI.Filters.js',
      'components/CUI.Slider.js',
      'components/CUI.Datepicker.js',
      'components/CUI.Pulldown.js',
      'components/CUI.Sticky.js',
      'components/CUI.PathBrowser.js'
    ],
    "cui-rte": [
      'components/rte/ui/Theme.js',
      'components/rte/ui/cui/ToolkitImpl.js',
      'components/rte/ui/cui/ToolbarImpl.js',
      'components/rte/ui/cui/ElementImpl.js',
      'components/rte/ui/cui/ParaFormatterImpl.js',
      'components/rte/ui/cui/StyleSelectorImpl.js',
      'components/rte/ui/cui/CuiToolbarBuilder.js',
      'components/rte/ui/cui/CmItemImpl.js',
      'components/rte/ui/cui/CmSeparatorImpl.js',
      'components/rte/ui/cui/CuiContextMenuBuilder.js',
      'components/rte/ui/cui/CuiDialogManager.js',
      'components/rte/ui/cui/CuiDialogHelper.js',

      'components/rte/ui/stub/ToolkitImpl.js',
      'components/rte/ui/stub/ToolbarImpl.js',
      'components/rte/ui/stub/ElementImpl.js',
      'components/rte/ui/stub/ParaFormatterImpl.js',
      'components/rte/ui/stub/StyleSelectorImpl.js',
      'components/rte/ui/stub/StubToolbarBuilder.js',
      'components/rte/ui/stub/CmItemImpl.js',
      'components/rte/ui/stub/CmSeparatorImpl.js',
      'components/rte/ui/stub/StubContextMenuBuilder.js',
      'components/rte/ui/stub/StubDialogManager.js',
      'components/rte/ui/stub/StubDialogHelper.js',

      'components/CUI.RichText.js',

      'components/rte/init.js'
    ]
  };

  var packages = {
    "cui": [ "cui-templates", "cui"],
    "cui-rte": [ "cui-rte" ]
  };

  /**
    Build directories
    Any directories used by the build should be defined here
  */
  var dirs = {
    build: 'build',
    source: 'source',
    temp: 'temp',
    components: 'components',
    modules: 'node_modules'
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

  // External tasks
  grunt.loadTasks('tasks');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-compress');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-handlebars');
  grunt.loadNpmTasks('grunt-contrib-mincss');
  grunt.loadNpmTasks('grunt-contrib-less');
  grunt.loadNpmTasks('grunt-mocha');

  // Read in package.json
  var pkg = grunt.file.readJSON('package.json');

  grunt.initConfig({
    // Meta and build configuration
    meta: {
      version: pkg.version,
      appName: pkg.name,
      appWebSite: pkg.repository.url
    },
    dirs: dirs,

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
          '_',            // Underscore
          'Handlebars',   // Handlebars
          'prettyPrint',  // google-code-prettify
          'CUI',          // CoralUI
          'Class'         // Class
        ]
      },
      globals: {}
    },

    // Task definitions
    clean: {
      build: '<%= dirs.build %>',
      jsdoc: '<%= dirs.build %>/jsdoc',
      tests: [
        '<%= dirs.build %>/test/*.js',
        '<%= dirs.build %>/test/*.html'
      ]
    },

    copy: {
      guide: {
        src: '<%= dirs.source %>/guide/**',
        dest: '<%= dirs.build %>/'
      },
      images: {
        options: {
          basePath: 'images'
        },
        src: '<%= dirs.source %>/images/**',
        dest: '<%= dirs.build %>/images/'
      },
      fonts: {
        src: '<%= dirs.source %>/fonts/**',
        dest: '<%= dirs.build %>/fonts/'
      },
      less_bootstrap_tmp: {
        src: '<%= dirs.components %>/bootstrap/less/*',
        dest: '<%= dirs.temp %>/less/bootstrap/'
      },
      less_bootstrap_build: {
        src: '<%= dirs.components %>/bootstrap/less/*',
        dest: '<%= dirs.build %>/less/bootstrap/'
      },
      less_cui: {
        src: '<%= dirs.source %>/less/**',
        dest: '<%= dirs.build %>/less/'
      },
      libs: {
        files: {
          '<%= dirs.build %>/js/libs/jquery.js': '<%= dirs.components %>/jquery/index.js',
          '<%= dirs.build %>/js/libs/underscore.js': '<%= dirs.components %>/underscore/index.js',
          '<%= dirs.build %>/js/libs/handlebars.js': '<%= dirs.components %>/handlebars/index.js'
        }
      },
      dependencies: {
        files: {
          '<%= dirs.build %>/js/libs/toe.js': '<%= dirs.source %>/js/plugins/toe.js',
          '<%= dirs.build %>/js/libs/jquery-fingerpointer.js': '<%= dirs.source %>/js/plugins/jquery-fingerpointer.js',
          '<%= dirs.build %>/js/libs/jquery-gridlayout.js': '<%= dirs.source %>/js/plugins/jquery-gridlayout.js'
        }
      },
      prettyify: {
        src: '<%= dirs.components %>/bootstrap/docs/assets/js/google-code-prettify/*',
        dest: '<%= dirs.build %>/examples/assets/google-code-prettify/'
      },
      tests: {
        src: '<%= dirs.source %>/test/**',
        dest: '<%= dirs.build %>/test/'
      },
      test_libs: {
        files: {
          '<%= dirs.build %>/test/libs/mocha/': [
            '<%= dirs.modules %>/mocha/mocha.js',
            '<%= dirs.modules %>/mocha/mocha.css'
          ],
          '<%= dirs.build %>/test/libs/chai/': [
            '<%= dirs.modules %>/chai/chai.js'
          ],
          '<%= dirs.build %>/test/libs/chai-jquery/': [
            '<%= dirs.modules %>/chai-jquery/chai-jquery.js'
          ],
          '<%= dirs.build %>/test/libs/sinon/': [
            '<%= dirs.modules %>/sinon/lib/**'
          ],
          '<%= dirs.build %>/test/libs/sinon-chai/': [
            '<%= dirs.modules %>/sinon-chai/lib/sinon-chai.js'
          ]
        }
      }
    },

    mincss: {
      main: {
        files: {
          '<%= dirs.build %>/css/cui.min.css': '<%= dirs.build %>/css/cui.css'
        }
      }
    },

    handlebars: {
      compile: {
        options: {
          wrapped: true,
          namespace: 'CUI.Templates',
          processName: function(path) {
            // Pull the filename out as the template name
            return path.split('/').pop().split('.').shift();
          }
        },
        files: {
          '<%= dirs.build %>/js/CUI.Templates.js': '<%= dirs.source %>/templates/*'
        }
      }
    },

    compress: {
      release: {
        options: {
          mode: 'zip'
        },
        files: {
          '<%= dirs.build %>/cui-<%= meta.version %>.zip': [
            '<%= dirs.build %>/css/**',
            '<%= dirs.build %>/fonts/**',
            '<%= dirs.build %>/images/**',
            '<%= dirs.build %>/js/**',
            '<%= dirs.build %>/less/**'
          ]
        }
      },
      full: {
        options: {
          mode: 'zip'
        },
        files: {
          '<%= dirs.build %>/cui-<%= meta.version %>-full.zip': [
            '<%= dirs.build %>/css/**',
            '<%= dirs.build %>/examples/**',
            '<%= dirs.build %>/fonts/**',
            '<%= dirs.build %>/images/**',
            '<%= dirs.build %>/js/**',
            '<%= dirs.build %>/jsdoc/**',
            '<%= dirs.build %>/less/**',
            '<%= dirs.build %>/test/**',
            '<%= dirs.build %>/index.html'
          ]
        }
      }
    },

    jsdoc3: {
      cui: {
        template: '<%= dirs.source %>/docTemplate',
        jsdoc: '<%= dirs.components %>/JSDoc/jsdoc',
        src: ['<%= dirs.source %>/js/*.js','<%= dirs.source %>/js/components/**'],
        dest: '<%= dirs.build %>/jsdoc'
      }
    },

    lint: {
      files: [
        'grunt.js',
        // exclude RTE for now ...
        '<%= dirs.source %>/js/*.js',
        '<%= dirs.source %>/js/components/*',
        '<%= dirs.source %>/guide/examples/assets/guide.js'
      ]
    },

    concat: {
      cui: {
        src: getIncludes("cui", dirs.source+'/js/'),
        dest: '<%= dirs.build %>/js/CUI.js'
      },
      cui_cc: {
        src: getIncludes("cui", dirs.temp+'/js_instrumented/'),
        dest: '<%= dirs.temp %>/js_instrumented/CUI_cc.js'
      },
      cui_css: {
        src: [
          '<%= dirs.temp %>/cui.css',
          '<%= dirs.temp %>/allIcons.css'
        ],
        dest: '<%= dirs.build %>/css/cui.css'
      },
      cui_rte: {
        src: getIncludes("cui-rte", dirs.source+'/js/'),
        dest: '<%= dirs.build %>/js/cui-rte.js'
      }
    },

    min: {
      cui: {
        src: ['<config:concat.cui.dest>'],
        dest: '<%= dirs.build %>/js/CUI.min.js'
      },
      cui_rte: {
        src: ['<config:concat.cui-rte.dest>'],
        dest: '<%= dirs.build %>/js/cui-rte.min.js'
      }
      // TBD: minify individual JS files?
    },

    less: {
      "cui-wrapped": {
        options: {
          paths: [  // grunt-contrib-less doesn't support template tags, use dirs instead
            dirs.source+'/less/',
            dirs.temp+'/less/'
          ]
        },
        files: {
          '<%= dirs.temp %>/cui-wrapped.css': '<%= dirs.source %>/less/cui-wrapped.less'
        }
      },
      "cui": {
        options: {
          paths: [  // grunt-contrib-less doesn't support template tags, use dirs instead
            dirs.source+'/less/',
            dirs.temp+'/less/'
          ]
        },
        files: {
          '<%= dirs.temp %>/cui.css': '<%= dirs.source %>/less/cui.less'
        }
      },
      "guide": {
        options: {
          paths: [  // grunt-contrib-less doesn't support template tags, use dirs instead
            dirs.source+'/less/', // must hardcode paths here, grunt-contrib-less doesn't support template tags
            dirs.temp+'/less/' // must hardcode paths here, grunt-contrib-less doesn't support template tags
          ]
        },
        files: {
          '<%= dirs.build %>/examples/assets/guide.css': '<%= dirs.source %>/guide/examples/assets/guide.less'
        }
      }
    },

    mvn: {
      build: {}
    },

    mocha: {
      cui: {
        run: true,

        src: [
          '<%= dirs.build %>/test/index.html'
        ]
      }
    },

    coverage: {},

    icons: {
      all: {
        src: [
          '<%= dirs.source %>/images/icons/*.svg'
        ],
        dest: '<%= dirs.temp %>/allIcons.css'
      }
    },

    // Watch operations
    watch: {
      copy_guide: {
        files: '<%= dirs.source %>/guide/**',
        tasks: 'copy:guide'
      },

      lint_js: {
        files: '<config:lint.files>',
        tasks: 'lint'
      },

      concat_min_js: {
        files: [
          '<%= dirs.source %>/js/**'
        ],
        tasks: 'concat:cui min:cui'
      },

      compile_less_min_css: {
        files: '<%= dirs.source %>/less/**',
        tasks: 'less:cui mincss concat:cui_css'
      },

      compile_guide_less: {
        files: '<%= dirs.source %>/guide/examples/assets/guide.less',
        tasks: 'less:guide'
      },

      compile_handlebars: {
        files: '<%= dirs.source %>/templates/*',
        tasks: 'handlebars concat:cui min:cui'
      },

      copy_tests: {
        files: '<%= dirs.source %>/test/**',
        tasks: 'clean:tests copy:tests'
      },

      copy_plugins: {
          files: '<%= dirs.source %>/js/plugins/**',
          tasks: "copy:libs"
      },

      run_tests: {
        files: [
          '<%= dirs.source %>/js/**',
          '<%= dirs.build %>/js/CUI.Templates.js',
          '<%= dirs.source %>/test/**'
        ],
        tasks: 'mocha'
      }
    }
  });

  // Partial build for development
  grunt.registerTask('partial', 'lint copy handlebars concat:cui min:cui icons less concat:cui_css mincss mocha');

  // Full build with docs and compressed file
  grunt.registerTask('full-build', 'lint copy handlebars concat:cui concat:cui_rte min icons less concat:cui_css mincss mocha jsdoc');

  // Full build with docs and compressed file
  grunt.registerTask('full', 'clean full-build');

  // Release build
  // TODO: add maven?
  grunt.registerTask('release', 'clean full-build coverage compress');

  // Rename mvn task so we can override it
  grunt.task.renameTask('mvn', 'mvn-install');

  // Almost full build, just the stuff needed for Granite install
  grunt.registerTask('mvn-build', 'clean lint copy:images copy:fonts copy:dependencies copy:less_bootstrap_tmp copy:less_bootstrap_build copy:less_cui handlebars concat:cui less:cui concat:cui_css');

  // Custom build for maven
  grunt.registerTask('mvn', 'mvn-build mvn-install');

  // Rename mvn-deploy task so we can override it
  grunt.task.renameTask('mvn-deploy', 'mvn-nexus-deploy');

  // mvn deploy task for jenkins
  grunt.registerTask('mvn-deploy', 'mvn-build mvn-nexus-deploy');

  // Rename watch task so we can override it
  grunt.task.renameTask('watch', 'watch-start');

  // Redefine watch to build partial first
  grunt.registerTask('watch', 'partial watch-start');

  // Rename jsdoc task so we can override it
  grunt.task.renameTask('jsdoc', 'jsdoc3');

  // Redefine jsdoc task to clean first
  grunt.registerTask('jsdoc', 'clean:jsdoc jsdoc3');

  // Default task
  grunt.registerTask('default', 'partial');
};
