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

  tests: {
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
