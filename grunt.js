/*global module:false*/
module.exports = function(grunt) {
  /**
   JavaScript file include order
   Add new components to this array _after_ the components they inherit from
  */
  var includeOrder = {
    "base": [
      'Class.js'
    ],
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
      'components/CUI.Rail.js'
    ],
    "rte-core": [
      'rte/setup.js',

      'rte/core/adapter/Utils.js',
      'rte/core/adapter/Hooks.js',
      'rte/core/adapter/Eventing.js',
      'rte/core/adapter/Query.js',
      'rte/core/adapter/Constants.js',

      'rte/core/EditContext.js',
      'rte/core/EditorKernel.js',
      'rte/core/IFrameKernel.js',
      'rte/core/DivKernel.js',
      'rte/core/Common.js',
      'rte/core/HtmlProcessor.js',
      'rte/core/DomProcessor.js',
      'rte/core/WhitespaceProcessor.js',
      'rte/core/NodeList.js',
      'rte/core/Selection.js',
      'rte/core/UndoManager.js',
      'rte/core/TableMatrix.js',
      'rte/core/ListUtils.js',
      'rte/core/ListRepresentation.js',
      'rte/core/CellSelection.js',
      'rte/core/SearchableDocument.js',
      'rte/core/Compatibility.js',
      'rte/core/HtmlRules.js',
      'rte/core/Serializer.js',
      'rte/core/HtmlSerializer.js',
      'rte/core/XhtmlSerializer.js',
      'rte/core/Deserializer.js',
      'rte/core/HtmlDeserializer.js',
      'rte/core/XhtmlDeserializer.js',
      'rte/core/DomCleanup.js',
      'rte/core/EditorEvent.js',

      'rte/core/commands/Command.js',
      'rte/core/commands/CommandRegistry.js',
      'rte/core/commands/Delete.js',
      'rte/core/commands/SurroundBase.js',
      'rte/core/commands/DefaultFormatting.js',
      'rte/core/commands/Anchor.js',
      'rte/core/commands/CutCopy.js',
      'rte/core/commands/Format.js',
      'rte/core/commands/Indent.js',
      'rte/core/commands/InsertHtml.js',
      'rte/core/commands/Justify.js',
      'rte/core/commands/Link.js',
      'rte/core/commands/List.js',
      'rte/core/commands/Outdent.js',
      'rte/core/commands/Paste.js',
      'rte/core/commands/Style.js',
      'rte/core/commands/Table.js',
      'rte/core/commands/Image.js',
      'rte/core/commands/UndoRedo.js',

      'rte/core/plugins/Plugin.js',
      'rte/core/plugins/PluginRegistry.js',
      'rte/core/plugins/PluginEvent.js',
      'rte/core/plugins/KeyPlugin.js',
      'rte/core/plugins/SimpleFormatPlugin.js',
      'rte/core/plugins/EditToolsPlugin.js',
      'rte/core/plugins/FindReplacePlugin.js',
      'rte/core/plugins/FormatPlugin.js',
      'rte/core/plugins/JustifyPlugin.js',
      'rte/core/plugins/LinkPlugin.js',
      'rte/core/plugins/ListPlugin.js',
      'rte/core/plugins/MiscToolsPlugin.js',
      'rte/core/plugins/ParagraphFormatPlugin.js',
      'rte/core/plugins/StylesPlugin.js',
      'rte/core/plugins/SubSuperScriptPlugin.js',
      'rte/core/plugins/TablePlugin.js',
      'rte/core/plugins/ImagePlugin.js',
      'rte/core/plugins/UndoRedoPlugin.js',
      'rte/core/plugins/SpellCheckerPlugin.js',

      'rte/core/adapter/JQueryEvent.js',
      'rte/core/adapter/ExtEvent.js',

      'rte/core/ui/Toolkit.js',
      'rte/core/ui/ToolkitRegistry.js',
      'rte/core/ui/UIEvent.js',
      'rte/core/ui/ToolbarBuilder.js',
      'rte/core/ui/Toolbar.js',
      'rte/core/ui/TbElement.js',
      'rte/core/ui/TbParaFormatter.js',
      'rte/core/ui/TbStyleSelector.js',
      'rte/core/ui/ContextMenuBuilder.js',
      'rte/core/ui/CmItem.js',
      'rte/core/ui/CmSeparator.js',
      'rte/core/ui/DialogManager.js',
      'rte/core/ui/DialogHelper.js'
    ],
    "rte-cui": [
      'rte/ui/Theme.js',
      'rte/ui/cui/ToolkitImpl.js',
      'rte/ui/cui/ToolbarImpl.js',
      'rte/ui/cui/ElementImpl.js',
      'rte/ui/cui/ParaFormatterImpl.js',
      'rte/ui/cui/StyleSelectorImpl.js',
      'rte/ui/cui/CuiToolbarBuilder.js',
      'rte/ui/cui/CmItemImpl.js',
      'rte/ui/cui/CmSeparatorImpl.js',
      'rte/ui/cui/StubContextMenuBuilder.js',
      'rte/ui/stub/ToolkitImpl.js',
      'rte/ui/stub/ToolbarImpl.js',
      'rte/ui/stub/ElementImpl.js',
      'rte/ui/stub/ParaFormatterImpl.js',
      'rte/ui/stub/StyleSelectorImpl.js',
      'rte/ui/stub/StubToolbarBuilder.js',
      'rte/ui/stub/CmItemImpl.js',
      'rte/ui/stub/CmSeparatorImpl.js',
      'rte/ui/stub/StubContextMenuBuilder.js',
      'rte/ui/stub/StubDialogManager.js',
      'rte/ui/stub/StubDialogHelper.js',

      'rte/CUI.RichText.js'
    ],
    "rte-trailer": [
      'rte/init.js'
    ]
  };

  var packages = {
    "cui": [ "cui-templates", "base", "cui"],
    "rte-core": [ "base", "rte-core" ],
    "cui-with-rte": [ "cui-templates", "base", "rte-core", "cui", "rte-cui", "rte-trailer" ]
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
          'Class',        // Class
          'CQ', '$CQ'     // temporary (RTE dev)
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
          '<%= dirs.build %>/js/libs/handlebars.js': '<%= dirs.components %>/handlebars/index.js',
          '<%= dirs.build %>/js/libs/toe.js': '<%= dirs.components %>/toejs/index.js',
          '<%= dirs.build %>/js/libs/fingerpointer.js': '<%= dirs.components %>/fingerpointer/index.js'
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
        // exclude RTE for now ...
        '<%= dirs.source %>/js/*.js',
        '<%= dirs.source %>/js/components/**',
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
      "rte-core": {
        src: getIncludes("rte-core", dirs.source+'/js/'),
        dest: '<%= dirs.build %>/js/rte-core.js'
      },
      "cui-with-rte": {
        src: getIncludes("cui-with-rte", dirs.source+'/js/'),
        dest: '<%= dirs.build %>/js/CUI-with-rte.js'
      }
    },

    min: {
      cui: {
        src: ['<config:concat.cui.dest>'],
        dest: '<%= dirs.build %>/js/CUI.min.js'
      },
      "rte-core": {
        src: ['<config:concat.rte-core.dest>'],
        dest: '<%= dirs.build %>/js/rte-core.min.js'
      },
      "cui-with-rte": {
        src: ['<config:concat.cui-with-rte.dest>'],
        dest: '<%= dirs.build %>/js/CUI-with-rte.min.js'
      }
      // TBD: minify individual JS files?
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
  grunt.registerTask('partial', 'lint copy handlebars concat:cui concat:rte-core concat:cui-with-rte min less mincss mocha');

  // Full build with docs and compressed file
  grunt.registerTask('full-build', 'lint copy handlebars concat:cui concat:rte-core concat:cui-with-rte min less mincss mocha jsdoc');

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
