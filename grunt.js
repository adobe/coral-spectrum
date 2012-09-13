/*global module:false*/
module.exports = function(grunt) {
  // External tasks
  grunt.loadTasks('tasks');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-compress');
  grunt.loadNpmTasks('grunt-contrib-copy');
  //grunt.loadNpmTasks('grunt-contrib-handlebars'); // waiting on fix for hb4
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
      temp: 'temp/'
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
          '$',        // jQuery
          'jQuery',     // jQuery
          'console',      // console.log...
          'Backbone',     // Backbone
          '_',        // Underscore
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
            './components/backbone/backbone.js',
            './components/underscore/underscore.js',
            './components/jquery/jquery.js'
          ]
        }
      }
    },
    
    handlebars: {
      compile: {
        options: {
          namespace: "this",
          processName: function(path) {
            // Pull the filename out as the template name
            return path.split('/').pop().split('.').shift();
          }
        },
        files: {
          "<%= dirs.temp %>Templates.js": "<%= dirs.source %>templates/*"
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
        src: ['js/**'],
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
          '<%= dirs.source %>js/CUI.js',    // Namespace
          '<%= dirs.temp %>Templates.js'    // Templates
        ],
        dest: '<%= dirs.build %>js/cui.js'
      }
    },

    min: {
      js: {
        src: ['<config:concat.js.dest>'],
        dest: '<%= dirs.build %>js/cui.min.js'
      }, // TBD: minify individual JS files?
      jquery: {
        src: 'components/jquery/jquery.js',
        dest: '<%= dirs.build %>js/libs/jquery.min.js'
      },
      backbone: {
        src: 'components/backbone/backbone.js',
        dest: '<%= dirs.build %>js/libs/backbone.min.js'
      },
      underscore: {
        src: 'components/underscore/underscore.js',
        dest: '<%= dirs.build %>js/libs/underscore.min.js'
      }
    },

    less: {
      compile: {
        options: {
          paths: ['source/less/'] // must hardcore source here, grunt-contrib-less doesn't support config!
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

      lint: {
        files: '<config:lint.files>',
        tasks: 'lint'
      },

      concatjs: {
        files: '<%= dirs.source %>js/**',
        tasks: 'concat:js'
      },

      min: {
        files: '<config:concat.js.dest>',
        tasks: 'min'
      },

      less: {
        files: ['<%= dirs.source %>less/**'],
        tasks: 'less'
      }
    }
  });
  
  // Partial build for development
  grunt.registerTask('partial', 'clean less lint copy handlebars concat');

  // Full build with docs and compressed file
  // TODO: some sort of clean JSDoc install?
  //grunt.registerTask('full', 'clean less lint copy handlebars concat min jsdoc compress');
  grunt.registerTask('full', 'clean less lint copy handlebars concat min compress');
  
  // Default task
  grunt.registerTask('default', 'partial');
};
