/*global module:false*/
module.exports = function(grunt) {
  // External tasks
  grunt.loadTasks('tasks');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-compress');
  grunt.loadNpmTasks('grunt-contrib-copy');
  //grunt.loadNpmTasks('grunt-contrib-handlebars'); // waiting on fix for hb4
  grunt.loadNpmTasks('grunt-contrib-mincss');
  grunt.loadNpmTasks('grunt-contrib-less');

  grunt.initConfig({
    // Meta and build configuration
    meta: {
      version: '0.1.0',
      appName: 'CloudUI',
      appWebSite: 'git.corp.adobe.com/lazd/CloudUI'
    },
    dirs: {
      build: 'build/',
      source: 'source/',
      temp: 'temp/',
      components: 'components/'
    },

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
          'Handlebars'    // Handlebars
        ]
      },
      globals: {}
    },

    // Task definitions
    clean: {
      build: '<%= dirs.build %>'
    },

    copy: {
      examples: {
        files: {
          '<%= dirs.build %>examples': '<%= dirs.source %>examples/**'
        }
      },
      images: {
        options: {
          basePath: 'images'
        },
        files: {
          '<%= dirs.build %>images': '<%= dirs.source %>images/**'
        }
      },
      fonts: {
        files: {
          '<%= dirs.build %>fonts': '<%= dirs.source %>fonts/**'
        }
      },
      libs: {
        options: {
          flatten: true // don't create backbone/jquery/underscore folders inside of libs/
        },
        files: {
          '<%= dirs.build %>js/libs': [
            '<%= dirs.components %>backbone/backbone.js',
            '<%= dirs.components %>underscore/underscore.js',
            '<%= dirs.components %>jquery/jquery.js'
          ]
        }
      }
    },
    
    mincss: {
      main: {
        files: {
          '<%= dirs.build %>css/cui.min.css': '<%= dirs.build %>css/cui.css'
        }
      }
    },
    
    handlebars: {
      compile: {
        options: {
          namespace: 'this',
          processName: function(path) {
            // Pull the filename out as the template name
            return path.split('/').pop().split('.').shift();
          }
        },
        files: {
          '<%= dirs.build %>js/CUI.Templates.js': '<%= dirs.source %>templates/*'
        }
      }
    },
    
    compress: {
      zip: {
        options: {
          mode: 'zip'
        },
        files: {
          '<%= dirs.build %>cui.zip': [
            '<%= dirs.build %>/js/**',
            '<%= dirs.build %>/css/**',
            '<%= dirs.build %>/images/**',
            '<%= dirs.build %>/fonts/**'
          ]
        }
      }
    },
    
    jsdoc: {
      cui: {
        jsdoc: '<%= dirs.components %>JSDoc/jsdoc',
        src: ['<%= dirs.source %>js/**'],
        dest: '<%= dirs.build %>jsdoc'
      }
    },

    lint: {
      files: [
        'grunt.js',
        '<%= dirs.source %>js/**'
      ]
    },

    concat: {
      js: {
        src: [
          '<%= dirs.source %>js/CUI.js',          // Namespace
          '<%= dirs.build %>js/CUI.Templates.js'  // Templates
        ],
        dest: '<%= dirs.build %>js/CUI.js'
      }
    },

    min: {
      cui: {
        src: ['<config:concat.js.dest>'],
        dest: '<%= dirs.build %>js/CUI.min.js'
      }, // TBD: minify individual JS files?
      jquery: {
        src: '<%= dirs.components %>jquery/jquery.js',
        dest: '<%= dirs.build %>js/libs/jquery.min.js'
      },
      backbone: {
        src: '<%= dirs.components %>backbone/backbone.js',
        dest: '<%= dirs.build %>js/libs/backbone.min.js'
      },
      underscore: {
        src: '<%= dirs.components %>underscore/underscore.js',
        dest: '<%= dirs.build %>js/libs/underscore.min.js'
      }
    },

    less: {
      compile: {
        options: {
          paths: [
            'source/less/', // must hardcore paths here, grunt-contrib-less doesn't support config
            'components/bootstrap/less'
          ]
        },
        files: {
          '<%= dirs.build %>css/cui.css': '<%= dirs.source %>less/cui.less'
        }
      }
    },

    // Watch operations
    watch: {
      copy_examples: {
        files: '<%= dirs.source %>examples/**',
        tasks: 'copy:examples'
      },

      lint_js: {
        files: '<config:lint.files>',
        tasks: 'lint'
      },

      concat_min_js: {
        files: '<%= dirs.source %>js/**',
        tasks: 'concat:js min:cui'
      },
      
      compile_less_min_css: {
        files: '<%= dirs.source %>less/**',
        tasks: 'less mincss'
      }
    }
  });
  
  // Partial build for development
  grunt.registerTask('partial', 'clean copy lint handlebars concat min:cui less mincss');
  
  // Full build with docs and compressed file
  grunt.registerTask('full', 'clean copy lint handlebars concat min less mincss jsdoc compress');
  
  // Default task
  grunt.registerTask('default', 'partial');
};
