module.exports = {
  core_jslibs: {
    files: [
      {
        // copies all of the external libs from core
        expand: true,
        cwd: '<%= dirs.modules %>/coralui-core/<%= dirs.build %>/',
        src: ['<%= dirs.js %>/libs/**'],
        dest: '<%= dirs.build %>/'
      }
    ]
  },

  core_resources: {
    // copies any other resources, except the core resources (icon, wait, progress & cursor)
    files: [
      {
        expand: true,
        cwd: '<%= dirs.modules %>/coralui-core/<%= dirs.build %>/',
        src: '<%= dirs.resources %>/**',
        dest: '<%= dirs.build %>/'
      }
    ]
  },

  component_resources: {
    files: [
      // copies all resources, except the core resources (icon, wait, progress & cursor)
      {
        expand: true,
        flatten: false,
        cwd: '<%= dirs.modules %>/',
        src: ['coralui-*/<%= dirs.build %>/<%= dirs.resources %>/**/*'],
        dest: '<%= dirs.build %>/<%= dirs.resources %>/',
        filter: function(srcPath) {
          var foundIcon = (srcPath.indexOf('components/icon/') > -1);
          var foundWait = (srcPath.indexOf('components/wait/') > -1);
          var foundProgress = (srcPath.indexOf('components/progress/') > -1);
          var foundCursors = (srcPath.indexOf('shared/cursors/') > -1);
          return !foundIcon && !foundWait && !foundProgress && !foundCursors;
        },
        rename: function(dest, matchedSrcPath, options) {
          return dest + matchedSrcPath.substring(matchedSrcPath.lastIndexOf('resources/') + 10);
        }
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
      // copies html documentation from components
      {
        expand: true,
        flatten: true,
        cwd: '<%= dirs.modules %>',
        src: ['coralui-component*/<%= dirs.build %>/<%= dirs.documentation %>/*.html'],
        dest: '<%= dirs.build %>/<%= dirs.documentation %>'
      },
      // copies from optional  documentation resources of components
      {
        expand: true,
        flatten: false,
        cwd: '<%= dirs.modules %>',
        src: [
          'coralui-component*/<%= dirs.build %>/<%= dirs.documentation %>/<%= dirs.resources %>/**'
        ],
        dest: '<%= dirs.build %>/<%= dirs.documentation %>/<%= dirs.resources %>',
        rename: function(dest, src) {
          return dest + src.substring(src.lastIndexOf('resources') + 'resources'.length);
        }
      }
    ]
  },

  /**
   * Copy JS and CSS directly from coralui-guide-resources for documentation
   */
  documentation_resources: {
    files: [
      {
        expand: true,
        cwd: '<%= dirs.modules %>/<%= dirs.guideResources %>',
        src: ['js/*', 'css/*'],
        dest: '<%= dirs.build %>/<%= dirs.documentation %>'
      }
    ]
  },

  /**
   * Copy tests
   */
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
