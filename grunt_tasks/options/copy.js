module.exports = {
  core_resources: {
    files: [
      {
        expand: true,
        cwd: '<%= dirs.modules %>/coralui-core/<%= dirs.build %>/',
        src: '<%= dirs.resources %>/**',
        dest: '<%= dirs.build %>/'
      }
    ]
  },

  core_jslibs: {
    files: [
      {
        // copies all of the external libs, as well as the typekit file, as the core examples rely on that.
        expand: true,
        cwd: '<%= dirs.modules %>/coralui-core/<%= dirs.build %>/',
        src: [ '<%= dirs.js %>/libs/**', '<%= dirs.js %>/typekit.js' ],
        dest: '<%= dirs.build %>/'
      }
    ]
  },

  core_documentation: {
    files: [
      // copies core documentation
      {
        expand: true,
        cwd: '<%= dirs.modules %>/coralui-core/<%= dirs.build %>/<%= dirs.documentation %>',
        src: ['*.html'],
        dest: '<%= dirs.build %>/<%= dirs.documentation %>'
      }
    ]
  },

  mixin_documentation: {
    files: [
      // copies mixin documentation
      {
        expand: true,
        flatten: true,
        cwd: '<%= dirs.modules %>',
        src: ['coralui-mixin*/<%= dirs.build %>/<%= dirs.documentation %>/*.html'],
        dest: '<%= dirs.build %>/<%= dirs.documentation %>'
      }
    ]
  },

  component_documentation: {
    files: [
      // copies component documentation
      {
        expand: true,
        flatten: true,
        cwd: '<%= dirs.modules %>',
        src: ['coralui-component*/<%= dirs.build %>/<%= dirs.documentation %>/*.html'],
        dest: '<%= dirs.build %>/<%= dirs.documentation %>'
      },
      {
        expand: true,
        flatten: false,
        cwd: '<%= dirs.modules %>',
        src: [
          'coralui-component*/<%= dirs.build %>/<%= dirs.documentation %>/resources/**'
        ],
        dest: '<%= dirs.build %>/<%= dirs.documentation %>/resources',
        rename: function (dest, src) {
          return dest + src.substring(src.lastIndexOf('resources') + 'resources'.length);
        }
      }
    ]
  },

  documentation_resources: {
    files: [
      {
        expand:true,
        cwd:'<%= dirs.modules %>/<%= dirs.documentationResources %>',
        src:['js/*','css/*'],
        dest: '<%= dirs.build %>/<%= dirs.documentation %>'
      }
    ]
  },

  /**
   * Copy the embedded resources.
   *
   * Note that we need to continue to copy up embed resources from dependent projects,
   * as we recompile the Stylus again.
   *
   * Also note that svg-stylus does not accept relative paths, so that we copy the files
   * from the coralui-/build/embed directory up to the current top-level.
   */
  component_embed: {
    files: [
      {
        expand: true,
        flatten: false,
        cwd: '',
        src: ['node_modules/coralui-*/build/embed/**/*'],
        dest: 'build/embed/',

        rename: function(dest, matchedSrcPath, options) {
          return dest + matchedSrcPath.substring( matchedSrcPath.lastIndexOf('embed/') + 6);
        }
      }
    ]
  },

  resources: {
    files: [
      // copies core resources
      {
        expand: true,
        cwd: '<%= dirs.modules %>/coralui-core/<%= dirs.build %>/<%= dirs.resources %>',
        src: ['*.html'],
        dest: '<%= dirs.build %>/<%= dirs.documentation %>',
        rename: function(dest, matchedSrcPath, options) {
          return dest + matchedSrcPath.substring( matchedSrcPath.lastIndexOf('resources/') + 10);
        }
      },
      // copies any other resources, except the core resources (icon, wait, progress & cursor)
      {
        expand: true,
        flatten: false,
        cwd: '',
        src: ['node_modules/coralui-*/build/resources/**/*'],
        dest: 'build/resources/',
        filter: function(srcPath) {
          var foundIcon = (srcPath.indexOf('components/icon/') > -1);
          var foundWait = (srcPath.indexOf('components/wait/') > -1);
          var foundProgress = (srcPath.indexOf('components/progress/') > -1);
          var foundCursors = (srcPath.indexOf('shared/cursors/') > -1);
          return !foundIcon && !foundWait && !foundProgress && !foundCursors;
        },
        rename: function(dest, matchedSrcPath, options) {
          return dest + matchedSrcPath.substring( matchedSrcPath.lastIndexOf('resources/') + 10);
        }
      }
    ]
  },

  component_tests: {
    files: [
      {
        expand: true,
        flatten: true,
        cwd: '<%= dirs.modules %>/',
        src: [
          'coralui-component*/<%= dirs.build %>/tests/test.*.js',
          'coralui-mixin-*/<%= dirs.build %>/tests/test.*.js'
        ],
        dest: '<%= dirs.build %>/tests'
      },
      {
        expand: true,
        flatten: false,
        cwd: '<%= dirs.modules %>/',
        src: ['coralui-*/<%= dirs.build %>/tests/fixtures/**'],
        filter: 'isFile',
        dest: '<%= dirs.build %>/tests/fixtures/',

        rename: function(dest, matchedSrcPath, options) {
          return dest + matchedSrcPath.substring(matchedSrcPath.indexOf('fixtures/') + 9);
        }
      },
      {
        expand: true,
        flatten: false,
        cwd: '<%= dirs.modules %>/',
        src: ['coralui-*/<%= dirs.build %>/tests/snippets/**'],
        filter: 'isFile',
        dest: '<%= dirs.build %>/tests/snippets/',

        rename: function(dest, matchedSrcPath, options) {
          return dest + matchedSrcPath.substring(matchedSrcPath.indexOf('snippets/') + 9);
        }
      }
    ]
  }
};
