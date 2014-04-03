// Copy Grunt Task Configuration
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

  core_examples: {
    files: [
      // copies core examples preserving hierarchy build/examples/component/*.html
      {
        expand: true,
        cwd: '<%= dirs.modules %>/coralui-core/<%= dirs.build %>',
        src: ['examples/**/*.*'],
        dest: '<%= dirs.build %>'
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

  component_examples: {
    files: [
      // copies component examples preserving hierarchy build/examples/component/*.html
      {
        expand: true,
        cwd: '<%= dirs.modules %>',
        src: ['coralui-component-*/<%= dirs.build %>/examples/**/*.*'],
        dest: '<%= dirs.build %>/examples',
        rename: function (dest, src) {
          var srcPath = src.split('/'),
            componentName = srcPath[srcPath.length - 2],
            fileName = srcPath[srcPath.length - 1]
            return dest + '/' + componentName + '/' + fileName;

        }
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
        src: ['coralui-component-*/<%= dirs.build %>/<%= dirs.documentation %>/*.html'],
        dest: '<%= dirs.build %>/<%= dirs.documentation %>'
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


  component_tests: {
    files: [
      {
        expand: true,
        flatten: true,
        cwd: '<%= dirs.modules %>/',
        src: ['coralui-*/<%= dirs.build %>/tests/test.*.js'],
        dest: '<%= dirs.build %>/tests'
      }
    ]
  }




}
// end copy
