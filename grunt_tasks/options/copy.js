module.exports = {
  core_jslibs: {
    files: [
      // copies all of the external libs from core
      {
        expand: true,
        cwd: '<%= dirs.modules %>/<%= dirs.scope %>/coralui-core/<%= dirs.build %>/',
        src: ['<%= dirs.js %>/libs/**'],
        dest: '<%= dirs.build %>/'
      }
    ]
  },

  theme_resources: {
    files: [
      // copies all resources from theme first, core might have newer resources
      {
        expand: true,
        flatten: false,
        cwd: '<%= dirs.modules %>/<%= dirs.scope %>/coralui-theme-*/<%= dirs.build %>/',
        src: '<%= dirs.resources %>/**',
        dest: '<%= dirs.build %>/'
      }
    ]
  },

  core_resources: {
    // copies all resources from core next
    files: [
      {
        expand: true,
        cwd: '<%= dirs.modules %>/<%= dirs.scope %>/coralui-core/<%= dirs.build %>/',
        src: '<%= dirs.resources %>/**',
        dest: '<%= dirs.build %>/'
      }
    ]
  },

  core_documentation: {
    files: [
      // copies core documentation
      {
        expand: true,
        cwd: '<%= dirs.modules %>/<%= dirs.scope %>/coralui-core/<%= dirs.build %>/<%= dirs.documentation %>',
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
        cwd: '<%= dirs.modules %>/<%= dirs.scope %>/',
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
        cwd: '<%= dirs.modules %>/<%= dirs.scope %>/',
        src: ['coralui-component*/<%= dirs.build %>/<%= dirs.documentation %>/*.html'],
        dest: '<%= dirs.build %>/<%= dirs.documentation %>'
      },
      // copies from optional  documentation resources of components
      {
        expand: true,
        flatten: false,
        cwd: '<%= dirs.modules %>/<%= dirs.scope %>/',
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
        cwd: '<%= dirs.modules %>/<%= dirs.scope %>/<%= dirs.guideResources %>',
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
        cwd: '<%= dirs.modules %>/<%= dirs.scope %>/',
        src: [
          'coralui-component*/<%= dirs.build %>/tests/test.*.js',
          'coralui-mixin-*/<%= dirs.build %>/tests/test.*.js'
        ],
        dest: '<%= dirs.build %>/tests'
      },
      {
        expand: true,
        flatten: false,
        cwd: '<%= dirs.modules %>/<%= dirs.scope %>/',
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
        cwd: '<%= dirs.modules %>/<%= dirs.scope %>/',
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
