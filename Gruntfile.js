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

      // Persistence
      'CUI.Util.state.js',

      // Touch
      'CUI.Util.isTouch.js',

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
      'components/CUI.LabeledSlider.js',      
      'components/CUI.Datepicker.js',
      'components/CUI.Pulldown.js',
      'components/CUI.Sticky.js',
      'components/CUI.CardView.js',
      'components/CUI.PathBrowser.js',
      'components/CUI.Wizard.js',
      'components/CUI.FileUpload.js',
      'components/CUI.Toolbar.js',
      'components/CUI.Tooltip.js'

    ],
    "cui-rte": [
      'components/rte/Theme.js',
      'components/rte/UIUtils.js',
      'components/rte/ConfigUtils.js',
      'components/rte/cui/ToolkitImpl.js',
      'components/rte/cui/ToolbarImpl.js',
      'components/rte/cui/ElementImpl.js',
      'components/rte/cui/ParaFormatterImpl.js',
      'components/rte/cui/StyleSelectorImpl.js',
      'components/rte/cui/CuiToolbarBuilder.js',
      'components/rte/cui/CmItemImpl.js',
      'components/rte/cui/CmSeparatorImpl.js',
      'components/rte/cui/CuiContextMenuBuilder.js',
      'components/rte/cui/CuiDialogManager.js',
      'components/rte/cui/CuiDialogHelper.js',

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
    bower: 'externals/components',
    modules: 'node_modules',
    rte: "rte"
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
  grunt.loadTasks('tasks/core');
  grunt.loadTasks('tasks/shared');

  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-compress');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-contrib-handlebars');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-less');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-watch');
//  grunt.loadNpmTasks('grunt-jsdoc');
  grunt.loadNpmTasks('grunt-mocha');
//  grunt.loadNpmTasks('grunt-hub');
  grunt.loadNpmTasks('grunt-zip');

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
          'Class',        // Class
          'moment'        // Moment.js
        ]
      },
      globals: {}
    },

    // Task definitions
    clean: {
      build: '<%= dirs.build %>',
      jsdoc: '<%= dirs.build %>/jsdoc',
      temp: '<%= dirs.temp %>',
      tests: [
        '<%= dirs.build %>/test/*.js',
        '<%= dirs.build %>/test/*.html'
      ]
    },

    copy: {
      guide: {
        files: [
          {
            expand: true,
            cwd: '<%= dirs.source %>/guide/',
            src: ['**'],
            dest: '<%= dirs.build %>/'
          }
        ]
      },
      images: {
        files: [
          {
            expand: true,
            cwd: '<%= dirs.source %>/images/',
            src: ['**'],
            dest: '<%= dirs.build %>/images'
          }
        ]
      },
      fonts: {
        files: [
          {
            expand: true,
            cwd: '<%= dirs.source %>/fonts/',
            src: ['**'],
            dest: '<%= dirs.build %>/fonts/'
          }
        ]
      },
      less_bootstrap_tmp: {
        files: [
          {
            expand: true,
            filter: 'isFile',
            cwd: '<%= dirs.bower %>/bootstrap/less/',
            src: ['*'],
            dest: '<%= dirs.temp %>/less/bootstrap/'
          }
        ]
      },
      less_bootstrap_build: {
        files: [
          {
            expand: true,
            filter: 'isFile',
            cwd: '<%= dirs.bower %>/bootstrap/less/',
            src: ['*'],
            dest: '<%= dirs.build %>/less/bootstrap/'
          }
        ]
      },
      less_cui: {
        files: [
          {
            expand: true,
            cwd: '<%= dirs.source %>/less/',
            src: ['**'],
            dest: '<%= dirs.build %>/less/'
          }
        ]
      },
      libs: {
        files: [
          {
            src: ['<%= dirs.bower %>/jquery/index.js'],
            dest: '<%= dirs.build %>/js/libs/jquery.js'
          },
          {
            src: ['<%= dirs.bower %>/underscore/index.js'],
            dest: '<%= dirs.build %>/js/libs/underscore.js'
          },
          {
            src: ['<%= dirs.bower %>/handlebars/index.js'],
            dest: '<%= dirs.build %>/js/libs/handlebars.js'
          },
          {
            src: ['<%= dirs.bower %>/handlebars-full/index.js'],
            dest: '<%= dirs.build %>/js/libs/handlebars.full.js'
          }
        ]
      },
      dependencies: {
        files: [
          {
            expand: true,
            cwd: '<%= dirs.source %>/js/plugins/',
            src: [
              'toe.js',
              'jquery-fingerpointer.js',
              'jquery-reflow.js',
              'jquery-gridlayout.js',
              'jquery-scrollable.js',
              'moment.js',
              'jquery-cookie.js'
            ],
            dest: '<%= dirs.build %>/js/libs/'
          }
        ]
      },
      rte: {
        files: [
          {
            src: ['<%= dirs.rte %>/build/js/rte-core-jquery.js'],
            dest: '<%= dirs.build %>/js/libs/rte-core-jquery.js'
          }
        ]
      },
      prettyify: {
        files: [
          {
            expand: true,
            cwd: '<%= dirs.bower %>/bootstrap/docs/assets/js/google-code-prettify/',
            src: ['*'],
            dest: '<%= dirs.build %>/js/google-code-prettify/'
          }
        ]
      },
      tests: {
        files: [
          {
            expand: true,
            cwd: '<%= dirs.source %>/',
            src: ['test/**'],
            dest: '<%= dirs.build %>/'
          }
        ]
      },
      test_libs: {
        files: [
          {
            expand: true,
            cwd: '<%= dirs.modules %>/',
            src: [
              'chai/chai.js',
              'chai-jquery/chai-jquery.js',
              'mocha/mocha.js',
              'mocha/mocha.css'
            ],
            dest: '<%= dirs.build %>/test/libs/'
          },
          {
            expand: true,
            cwd: '<%= dirs.modules %>/sinon/lib/',
            src: ['**'],
            dest: '<%= dirs.build %>/test/libs/sinon/'
          },
          {
            expand: true,
            cwd: '<%= dirs.modules %>/sinon-chai/lib/',
            src: ['sinon-chai.js'],
            dest: '<%= dirs.build %>/test/libs/sinon-chai/'
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
          '<%= dirs.build %>/js/CUI.Templates.js': '<%= dirs.source %>/templates/cui/*'
        }
      },
      "rte": {
        options: {
          wrapped: true,
          namespace: 'CUI.rte.Templates',
          processName: function(path) {
            // Pull the filename out as the template name
            return path.split('/').pop().split('.').shift();
          }
        },
        files: {
          '<%= dirs.build %>/js/cui-rte.templates.js': '<%= dirs.source %>/templates/rte/*'
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

    'jsdoc-build': {
      cui: {
        options: {
          template: '<%= dirs.source %>/docTemplate',
          destination: '<%= dirs.build %>/jsdoc'
        },
        src: [
          '<%= dirs.source %>/js/*.js',
          '<%= dirs.source %>/js/components/**'
        ]
      }
    },

    lint: {
      files: [
        'Gruntfile.js',
        // exclude RTE for now ...
        '<%= dirs.source %>/js/*.js',
        '<%= dirs.source %>/js/components/*',
        '<%= dirs.source %>/guide/js/*'
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
      cui_rte: {
        src: getIncludes("cui-rte", dirs.source+'/js/'),
        dest: '<%= dirs.build %>/js/cui-rte.js'
      }
    },

    /*
    hub: {
      rte: {
        src: [ '<%= dirs.rte%>/Gruntfile.js'],
        tasks: [ 'full' ]
      }
    },
    */
    subgrunt: {
      rte: {
        subdir: './rte/',
        args: ['full']
      }
    },

    uglify: {
      // TBD: minify individual JS files?
      cui: {
        files: {
          // TODO: make it work with reading the configuration option
          '<%= dirs.build %>/js/CUI.min.js': ['<%= dirs.build %>/js/CUI.js']
        }
      },
      cui_rte: {
        files: {
          // TODO: make it work with reading the configuration option
          '<%= dirs.build %>/js/cui-rte.min.js': ['<%= dirs.build %>/js/cui-rte.js']
        }
      }
    },

    less: {
      "cui-wrapped": {
        options: {
          paths: [  // grunt-contrib-less doesn't support template tags, use dirs instead
            dirs.build+'/less/',
            dirs.temp+'/less/'
          ]
        },
        files: {
          '<%= dirs.build %>/css/cui-wrapped.css': '<%= dirs.source %>/less/cui-wrapped.less'
        }
      },
      "cui": {
        options: {
          paths: [  // grunt-contrib-less doesn't support template tags, use dirs instead
            dirs.build+'/less/',
            dirs.temp+'/less/'
          ]
        },
        files: {
          '<%= dirs.build %>/css/cui.css': '<%= dirs.source %>/less/cui.less'
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
          '<%= dirs.build %>/css/guide.css': '<%= dirs.source %>/guide/less/guide.less'
        }
      },
      "wizard": {
        options: {
          paths: [  // grunt-contrib-less doesn't support template tags, use dirs instead
            dirs.source+'/less/', // must hardcode paths here, grunt-contrib-less doesn't support template tags
            dirs.temp+'/less/' // must hardcode paths here, grunt-contrib-less doesn't support template tags
          ]
        },
        files: {
          '<%= dirs.build %>/css/wizard.css': '<%= dirs.source %>/guide/less/wizard.less'
        }
      },
      "aemwelcome": {
        options: {
          paths: [  // grunt-contrib-less doesn't support template tags, use dirs instead
            dirs.source+'/less/', // must hardcode paths here, grunt-contrib-less doesn't support template tags
            dirs.temp+'/less/' // must hardcode paths here, grunt-contrib-less doesn't support template tags
          ]
        },
        files: {
          '<%= dirs.build %>/css/aem-welcome.css': '<%= dirs.source %>/guide/less/aem-welcome.less'
        }
      }
    },

    'mvn-goal': {
      install: {
        args: ['clean', 'install']
      },
      'content-package-install': {
        args: ['content-package:install']
      },
      deploy: {
        args: ['deploy']
      }
    },

    mocha: {
      cui: {
        src: [
          '<%= dirs.build %>/test/index.html'
        ],
        options: {
          run: true
        }
      }
    },

    coverage: {},

    font: {
      options: {
        src: '<%= dirs.source %>/images/icons/',
        dest_css: '<%= dirs.source %>/less/base/',
        dest_font: '<%= dirs.source %>/fonts/',
        dest_css_name: 'icons_mono.less',
        // Should write to build folder in the future: // dest_css_name: '<%= dirs.build %>/less/base/icons_mono.less',
        dest_font_name: 'AdobeIcons',
        prefix: 'icon-'
      }
    },

    athenaimport: {
    },

    unzip: {
      catalog: {
        src: '<%= unzip.src %>',
        dest: '<%= unzip.dest %>'
      }          
    },

    athenaconvert: {
      all:{
        src: '<%= athenaconvert.src %>',
        dest: '<%= dirs.source %>/images/icons/'       
      }
    },    

    icons: {
      all: {
        src: [
          '<%= dirs.source %>/images/icons_color/*.svg'
        ],
        dest: '<%= dirs.build %>/less/base/icons_color.less',
        prefix: 'icon-'
      }
    },

    iconbrowser: {
      all: {
        src: '<%= dirs.source %>/images/icons/**/*',
        dest: '<%= dirs.build %>/examples/assets/iconbrowser.json'
      }
    },

    // Watch operations
    'watch-start': {
      copy_guide: {
        files: '<%= dirs.source %>/guide/**',
        tasks: ['copy:guide']
      },

      lint_js: {
        files: '<config:lint.files>',
        tasks: ['lint']
      },

      concat_min_js: {
        files: [
          '<%= dirs.source %>/js/**'
        ],
        tasks: ['concat:cui', 'uglify:cui']
      },

      compile_less_min_css: {
        files: '<%= dirs.source %>/less/**',
        tasks: ['copy:less_cui', 'less:cui', 'cssmin']
      },

      compile_guide_less: {
        files: '<%= dirs.source %>/guide/less/guide.less',
        tasks: ['less:guide']
      },
      compile_wizard_less: {
        files: '<%= dirs.source %>/guide/less/wizard.less',
        tasks: ['less:wizard']
      },
      compile_aemwelcome_less: {
        files: '<%= dirs.source %>/guide/less/aem-welcome.less',
        tasks: ['less:aemwelcome']
      },

      compile_handlebars: {
        files: '<%= dirs.source %>/templates/*',
        tasks: ['handlebars:compile', 'concat:cui', 'uglify:cui']
      },

      copy_tests: {
        files: '<%= dirs.source %>/test/**',
        tasks: ['clean:tests', 'copy:tests']
      },

      copy_plugins: {
        files: '<%= dirs.source %>/js/plugins/**',
        tasks: ["copy:libs"]
      },

      run_tests: {
        files: [
          '<%= dirs.source %>/js/**',
          '<%= dirs.build %>/js/CUI.Templates.js',
          '<%= dirs.source %>/test/**'
        ],
        tasks: ['mocha']
      },

      // Note that this is only a "stub" implementation for watching changes in RTE. To get
      // the expected behavior, use the commented definition below (and see the notes there
      // on how to handle errors)
      rte: {
        files: ['<%= dirs.rte %>/Gruntfile.js'],
        tasks: ['subgrunt:rte', 'copy:rte']
      }

      /*

      Full RTE watch implementation - but use with caution: due to OS-specific limits,
      ulimit might need to be set explicitly before, otherwise NodeJS may choke.

      ulimit -n 1000 worked for me

      rte: {
        files: ["<%= dirs.rte %>/Gruntfile.js", "<%= dirs.rte %>/<%= dirs.source %>/" + "**"],
        tasks: 'subgrunt:rte copy:rte'
      }
      */

    }

  });

  // Import and convert icons from athena-zip
  grunt.task.registerTask('fromathena', [
    'athenaimport',
    'unzip:catalog',
    'athenaconvert'
  ]);

  // Partial build for development
  grunt.task.registerTask('partial', [
    'jshint',
    'font',
    'copy',
    'handlebars:compile',
    'icons',
    'iconbrowser',
    'concat:cui',
    'uglify:cui',
    'less',
    'cssmin'/*,
    'mocha'*/
  ]);

  // Build and copy RTE
  grunt.task.registerTask("rte", [
    'subgrunt:rte',
    'copy:rte'
  ]);

  // Full build with docs and compressed file
  grunt.task.registerTask('full-build', [
    'jshint',
    'rte',
    'font',
    'copy',
    'icons',
    'iconbrowser',
    'handlebars',
    'concat:cui',
    'concat:cui_rte',
    'uglify',
    'less',
    'cssmin',
//    'mocha',
    'jsdoc'
  ]);

  // Full build with docs and compressed file
  grunt.task.registerTask('full', [
    'clean',
    'full-build'
  ]);

  // Release build
  // TODO: add maven?
  grunt.task.registerTask('release', [
    'clean',
    'full-build',
    'coverage',
    'compress'
  ]);

  // Almost full build, just the stuff needed for Granite install
  grunt.task.registerTask('mvn-build', [
    'clean',
    'jshint',
    'copy:images',
    'copy:fonts',
    'copy:dependencies',
    'copy:less_bootstrap_tmp',
    'copy:less_bootstrap_build',
    'copy:less_cui',
    'font',
    'icons',
    'iconbrowser',
    'handlebars:compile',
    'concat:cui',
    'less:cui'
  ]);

  // Rename mvn task so we can override it
  grunt.task.renameTask('mvn', 'mvn-goal');

  // Custom build for maven
  grunt.task.registerTask('mvn', [
    'mvn-goal:install',
    'mvn-goal:content-package-install'
  ]);

  // mvn deploy task for jenkins
  grunt.task.registerTask('mvn-deploy', [
    'mvn-goal:install',
    'mvn-goal:deploy'
  ]);

  // Rename watch task so we can override it
  grunt.task.renameTask('watch', 'watch-start');

  // Redefine watch to build partial first
  grunt.task.registerTask('watch', [
    'partial',
    'watch-start'
  ]);

  // Rename jsdoc task so we can override it
  grunt.task.renameTask('jsdoc', 'jsdoc-build');

  // Redefine jsdoc task to clean first
  grunt.task.registerTask('jsdoc', [
    'clean:jsdoc',
    'jsdoc-build'
  ]);

  // Default task
  grunt.task.registerTask('default', [
    'partial'
  ]);
};
