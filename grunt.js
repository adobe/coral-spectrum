/*global module:false*/
module.exports = function(grunt) {
  // External tasks
  grunt.loadTasks('tasks');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-compress');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-handlebars');
  grunt.loadNpmTasks('grunt-contrib-mincss');
  grunt.loadNpmTasks('grunt-contrib-less');

  grunt.initConfig({
    // Meta and build configuration
    meta: {
      version: '0.1.0',
      appName: 'CoralUI',
      appWebSite: 'git.corp.adobe.com/Reef/CoralUI'
    },
    dirs: {
      build: 'build',
      source: 'source',
      temp: 'temp',
      components: 'components'
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
      jsdoc: '<%= dirs.build %>/jsdoc'
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
      zip: {
        options: {
          mode: 'zip'
        },
        files: {
          '<%= dirs.build %>/cui.zip': [
            '<%= dirs.build %>/js/**',
            '<%= dirs.build %>/css/**',
            '<%= dirs.build %>/less/**',
            '<%= dirs.build %>/images/**',
            '<%= dirs.build %>/fonts/**'
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
      js: {
        src: [
          '<%= dirs.source %>/js/Class.js',        // Class system
          '<%= dirs.source %>/js/CUI.js',          // Namespace
          '<%= dirs.build %>/js/CUI.Templates.js', // Templates
          
          // Components
          '<%= dirs.source %>/js/CUI.Util.js',
          '<%= dirs.source %>/js/components/CUI.Widget.js',
          '<%= dirs.source %>/js/components/CUI.Modal.js',
          '<%= dirs.source %>/js/components/CUI.Alert.js'
        ],
        dest: '<%= dirs.build %>/js/CUI.js'
      }
    },

    min: {
      cui: {
        src: ['<config:concat.js.dest>'],
        dest: '<%= dirs.build %>/js/CUI.min.js'
      } // TBD: minify individual JS files?
    },

    less: {
      cui: {
        options: {
          paths: [
            'source/less/', // must hardcode paths here, grunt-contrib-less doesn't support template tags
            'temp/less/' // must hardcode paths here, grunt-contrib-less doesn't support template tags
          ]
        },
        files: {
          '<%= dirs.build %>/css/cui.css': '<%= dirs.source %>/less/cui.less'
        }
      },
      guide: {
        options: {
          paths: [
            'source/less/', // must hardcode paths here, grunt-contrib-less doesn't support template tags
            'temp/less/' // must hardcode paths here, grunt-contrib-less doesn't support template tags
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
        files: ['<%= dirs.source %>/js/**', '<%= dirs.build %>/js/CUI.Templates.js'],
        tasks: 'concat:js min:cui'
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
        tasks: 'handlebars'
      }
    }
  });
  
  // Partial build for development
  grunt.registerTask('partial', 'lint copy handlebars concat min:cui less mincss');
  
  // Full build with docs and compressed file
  grunt.registerTask('full', 'clean lint copy handlebars concat min less mincss jsdoc compress');
  
  // Rename mvn task so we can override it
  grunt.task.renameTask('mvn', 'mvn-install');
  
  // Almost full build, just the stuff needed for Granite install
  grunt.registerTask('mvn-build', 'clean lint copy:images copy:fonts copy:less_bootstrap_tmp copy:less_bootstrap_build copy:less_cui handlebars concat less:cui');
  
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
