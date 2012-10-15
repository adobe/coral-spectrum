/*global module:false*/
module.exports = function(grunt) {
  /**
   JavaScript file include order
   Add new components to this array _after_ the components they inherit from
  */
  var includeOrder = [
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
    'components/CUI.Filters.js',
    'components/CUI.Slider.js'
  ];
  
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
    
    @param jsPath   Base path to prepend to each include
  */
  function getIncludes(jsPath) {
    var includes = [dirs.build+'/js/CUI.Templates.js'];
    includeOrder.forEach(function(file) { includes.push(jsPath+file); });
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
        src: ['<%= dirs.source %>/js/**'],
        dest: '<%= dirs.build %>/jsdoc'
      }
    },

    lint: {
      files: [
        'grunt.js',
        '<%= dirs.source %>/js/**',
        '<%= dirs.source %>/guide/examples/assets/guide.js'
      ]
    },

    concat: {
      cui: {
        src: getIncludes(dirs.source+'/js/'),
        dest: '<%= dirs.build %>/js/CUI.js'
      },
      cui_cc: {
        src: getIncludes(dirs.temp+'/js_instrumented/'),
        dest: '<%= dirs.temp %>/js_instrumented/CUI_cc.js'
      }
    },

    min: {
      cui: {
        src: ['<config:concat.cui.dest>'],
        dest: '<%= dirs.build %>/js/CUI.min.js'
      } // TBD: minify individual JS files?
    },

    less: {
      cui: {
        options: {
          paths: [  // grunt-contrib-less doesn't support template tags, use dirs instead
            dirs.source+'/less/',
            dirs.temp+'/less/'
          ]
        },
        files: {
          '<%= dirs.build %>/css/cui.css': '<%= dirs.source %>/less/cui.less'
        }
      },
      guide: {
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
        tasks: 'less:cui mincss'
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
      
      run_tests: {
        files: [
          '<%= dirs.source %>/js/**',
          '<%= dirs.build %>/js/CUI.Templates.js',
          '<%= dirs.source %>/test/**'
        ],
        tasks: 'mocha coverage'
      }
    }
  });
  
  // Partial build for development
  grunt.registerTask('partial', 'lint copy handlebars concat:cui min:cui less mincss mocha');
  
  // Full build with docs and compressed file
  grunt.registerTask('full-build', 'lint copy handlebars concat:cui min less mincss mocha jsdoc');
  
  // Full build with docs and compressed file
  grunt.registerTask('full', 'clean full-build');
  
  // Release build
  // TODO: add maven?
  grunt.registerTask('release', 'clean full-build coverage compress');
  
  // Rename mvn task so we can override it
  grunt.task.renameTask('mvn', 'mvn-install');
  
  // Almost full build, just the stuff needed for Granite install
  grunt.registerTask('mvn-build', 'clean lint copy:images copy:fonts copy:less_bootstrap_tmp copy:less_bootstrap_build copy:less_cui handlebars concat:cui less:cui');
  
  // Custom build for maven
  grunt.registerTask('mvn', 'mvn-build mvn-install');
  
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
