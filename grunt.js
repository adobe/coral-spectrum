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
      guide: {
        src: '<%= dirs.source %>guide/**',
        dest: '<%= dirs.build %>'
      },
      images: {
        options: {
          basePath: 'images'
        },
        src: '<%= dirs.source %>images/**',
        dest: '<%= dirs.build %>images'
      },
      fonts: {
        files: {
          '<%= dirs.build %>fonts': '<%= dirs.source %>fonts/**'
        }
      },
      less_bootstrap_tmp: {
        src: ['<%= dirs.components %>bootstrap/less/*'],
        dest: '<%= dirs.temp %>less/bootstrap'
      },
      less_bootstrap_build: {
        src: ['<%= dirs.components %>bootstrap/less/*'],
        dest: '<%= dirs.build %>less/bootstrap'
      },
      less_cui: {
        src: ['<%= dirs.source %>less/**'],
        dest: '<%= dirs.build %>less'
      },
      jquery: {
        options: {
          flatten: true,
          processName: function(filename) {
            return 'jquery.js';
          }
        },
        files: {
          '<%= dirs.build %>js/libs': '<%= dirs.components %>jquery/index.js'
        }
      },
      underscore: {
        options: {
          flatten: true,
          processName: function(filename) {
            return 'underscore.js';
          }
        },
        files: {
          '<%= dirs.build %>js/libs': '<%= dirs.components %>underscore/index.js'
        }
      },
      handlebars: {
        options: {
          flatten: true,
          processName: function(filename) {
            return 'handlebars.js';
          }
        },
        files: {
          '<%= dirs.build %>js/libs': '<%= dirs.components %>handlebars/index.js'
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
            '<%= dirs.build %>/less/**',
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
      } // TBD: minify individual JS files?
    },

    less: {
      compile: {
        options: {
          paths: [
            'source/less/', // must hardcore paths here, grunt-contrib-less doesn't support template tags
            'temp/less/' // must hardcore paths here, grunt-contrib-less doesn't support template tags
          ]
        },
        files: {
          '<%= dirs.build %>css/cui.css': '<%= dirs.source %>less/cui.less'
        }
      }
    },

    // Watch operations
    watch: {
      copy_guide: {
        files: '<%= dirs.source %>guide/**',
        tasks: 'copy:guide'
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
  grunt.registerTask('partial', 'copy lint handlebars concat min:cui less mincss');
  
  // Full build with docs and compressed file
  grunt.registerTask('full', 'clean copy lint handlebars concat min less mincss jsdoc compress');
  
  // Default task
  grunt.registerTask('default', 'partial');
};
