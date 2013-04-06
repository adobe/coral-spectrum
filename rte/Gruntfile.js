/*global module:false*/
module.exports = function (grunt) {
  /**
   JavaScript file include order
   Add new components to this array _after_ the components they inherit from
   */
  var includeOrder = {
    "rte-additional": [
      'additional/Class.js'
    ],
    "rte-setup": [
      'setup.js'
    ],
    "rte-jquery-adapter": [
      'core/adapter/jquery/Eventing.js',
      'core/adapter/EditorEvent.js',
      'core/adapter/jquery/JQueryEvent.js',
      'core/adapter/jquery/Query.js',
      'core/adapter/jquery/AdapterUtils.js',
      'core/adapter/Constants.js',
      'core/adapter/Hooks.js',
      'core/adapter/Utils.js'
    ],
    "rte-extjs-adapter": [
      'core/adapter/extjs/Eventing.js',
      'core/adapter/EditorEvent.js',
      'core/adapter/extjs/ExtEvent.js',
      'core/adapter/extjs/Query.js',
      'core/adapter/extjs/AdapterUtils.js',
      'core/adapter/Constants.js',
      'core/adapter/Hooks.js',
      'core/adapter/Utils.js'
    ],
    "rte-core": [
      'core/EditContext.js',
      'core/EditorKernel.js',
      'core/IFrameKernel.js',
      'core/DivKernel.js',
      'core/Common.js',
      'core/HtmlProcessor.js',
      'core/DomProcessor.js',
      'core/WhitespaceProcessor.js',
      'core/NodeList.js',
      'core/Selection.js',
      'core/UndoManager.js',
      'core/TableMatrix.js',
      'core/ListUtils.js',
      'core/ListRepresentation.js',
      'core/CellSelection.js',
      'core/SearchableDocument.js',
      'core/Compatibility.js',
      'core/HtmlRules.js',
      'core/Serializer.js',
      'core/HtmlSerializer.js',
      'core/XhtmlSerializer.js',
      'core/Deserializer.js',
      'core/HtmlDeserializer.js',
      'core/XhtmlDeserializer.js',
      'core/DomCleanup.js',

      'core/commands/Command.js',
      'core/commands/CommandRegistry.js',
      'core/commands/Delete.js',
      'core/commands/SurroundBase.js',
      'core/commands/DefaultFormatting.js',
      'core/commands/Anchor.js',
      'core/commands/CutCopy.js',
      'core/commands/Format.js',
      'core/commands/Indent.js',
      'core/commands/InsertHtml.js',
      'core/commands/Justify.js',
      'core/commands/Link.js',
      'core/commands/List.js',
      'core/commands/Outdent.js',
      'core/commands/Paste.js',
      'core/commands/Style.js',
      'core/commands/Table.js',
      'core/commands/Image.js',
      'core/commands/UndoRedo.js',

      'core/plugins/Plugin.js',
      'core/plugins/PluginRegistry.js',
      'core/plugins/PluginEvent.js',
      'core/plugins/KeyPlugin.js',
      'core/plugins/SimpleFormatPlugin.js',
      'core/plugins/EditToolsPlugin.js',
      'core/plugins/FindReplacePlugin.js',
      'core/plugins/FormatPlugin.js',
      'core/plugins/JustifyPlugin.js',
      'core/plugins/LinkPlugin.js',
      'core/plugins/ListPlugin.js',
      'core/plugins/MiscToolsPlugin.js',
      'core/plugins/ParagraphFormatPlugin.js',
      'core/plugins/StylesPlugin.js',
      'core/plugins/SubSuperScriptPlugin.js',
      'core/plugins/TablePlugin.js',
      'core/plugins/ImagePlugin.js',
      'core/plugins/UndoRedoPlugin.js',

      'core/ui/Toolkit.js',
      'core/ui/ToolkitRegistry.js',
      'core/ui/UIEvent.js',
      'core/ui/ToolbarBuilder.js',
      'core/ui/Toolbar.js',
      'core/ui/TbElement.js',
      'core/ui/TbParaFormatter.js',
      'core/ui/TbStyleSelector.js',
      'core/ui/ContextMenuBuilder.js',
      'core/ui/CmItem.js',
      'core/ui/CmSeparator.js',
      'core/ui/DialogManager.js',
      'core/ui/DialogHelper.js'
    ],
    "testing-env": [
      'env/ui/ToolkitImpl.js',
      'env/ui/ToolbarImpl.js',
      'env/ui/ElementImpl.js',
      'env/ui/ParaFormatterImpl.js',
      'env/ui/StyleSelectorImpl.js',
      'env/ui/StubToolbarBuilder.js',
      'env/ui/CmItemImpl.js',
      'env/ui/CmSeparatorImpl.js',
      'env/ui/StubContextMenuBuilder.js',
      'env/ui/StubDialogManager.js',
      'env/ui/StubDialogHelper.js',
      'env/Theme.js'
    ],
    "testing-lib": [
      'lib/debug.js',
      'lib/commons.js',
      'lib/comptesting.js',
      'lib/selection.js',
      'lib/configs.js',
      'lib/StubEditor.js'
    ],
    "testing": [
      'test_basics.js',
      'test_domcommons.js',
      'test_domprocessor.js',
      'test_selection.js',
      'test_nodelist.js',
      'test_lists.js',
      'test_table_basics.js',
      'startup.js'
    ]
  };

  var packages = {
    "rte-core-extjs": [ "rte-setup", "rte-additional", "rte-extjs-adapter", "rte-core" ],
    "rte-core-jquery": [ "rte-setup", "rte-jquery-adapter", "rte-core" ],
    "rte-additional": [ "rte-additional" ],
    "testing": [ "testing-env", "testing-lib", "testing" ]
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
    def.forEach(function (_set) {
      includeOrder[_set].forEach(function (_file) {
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
  grunt.loadTasks('../tasks/shared');

  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-compress');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-watch');

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

    // Task definitions
    clean: {
      build: '<%= dirs.build %>',
      tests: [
        '<%= dirs.build %>/test/*.js',
        '<%= dirs.build %>/test/*.html'
      ]
    },

    concat: {
      "rte-core-extjs": {
        "src": getIncludes("rte-core-extjs", dirs.source + '/js/'),
        "dest": "<%= dirs.build %>/js/rte-core-extjs.js"
      },
      "rte-core-jquery": {
        src: getIncludes("rte-core-jquery", dirs.source + '/js/'),
        dest: "<%= dirs.build %>/js/rte-core-jquery.js"
      },
      "rte-additional": {
        src: getIncludes("rte-additional", dirs.source + '/js/'),
        dest: "<%= dirs.build %>/js/rte-additional.js"
      },
      "test": {
        "src": getIncludes("testing", dirs.source + "/test/js/"),
        "dest": "<%= dirs.build %>/test/js/testing.js"
      }
    },

    copy: {
      "test": {
        files: [
          {
            expand: true,
            cwd: '<%= dirs.source %>/test/static/',
            src: ['**'],
            dest: '<%= dirs.build %>/test/'
          }
        ]
      },
      "libs-test": {
        files: {
          "<%= dirs.build %>/test/js/libs/jquery.js": "<%= dirs.bower %>/jquery/index.js"
        }
      }
    },

    uglify: {
      // TBD: minify individual JS files?
      "rte-core-extjs": {
        files: {
          // TODO: make it work with reading the configuration option
          '<%= dirs.build %>/js/rte-core-extjs.min.js': ['<%= dirs.build %>/js/rte-core-extjs.js']
        }
      },
      "rte-core-jquery": {
        files: {
          // TODO: make it work with reading the configuration option
          '<%= dirs.build %>/js/rte-core-jquery.min.js': ['<%= dirs.build %>/js/rte-core-jquery.js']
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

    // Watch operations
    'watch-start': {
      concat: {
        files: [
          '<%= dirs.source %>/**'
        ],
        tasks: ['concat']
      }
    }
  });

  // Partial build for development
  grunt.registerTask('partial', [
    'concat'
  ]);

  // Full build with docs and compressed file
  grunt.registerTask('full-build', [
    'concat',
    'uglify'
  ]);

  // Full build with docs and compressed file
  grunt.registerTask('full', [
    'clean',
    'full-build',
    'copy'
  ]);

  // Rename mvn task so we can override it
  grunt.renameTask('mvn', 'mvn-goal');

  // Custom build for maven
  grunt.registerTask('mvn', [
    'full',
    'mvn-goal:install',
    'mvn-goal:content-package-install'
  ]);

  // mvn deploy task for jenkins
  grunt.registerTask('mvn-deploy', [
    'mvn-goal:install',
    'mvn-goal:deploy'
  ]);

  // Rename watch task so we can override it
  grunt.renameTask('watch', 'watch-start');

  // Redefine watch to build partial first
  grunt.registerTask('watch', [
    'partial',
    'watch-start'
  ]);

  // Default task
  grunt.registerTask('default', [
    'partial'
  ]);
};
