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

  examples: {
    files: [
      // copies all the examples. They are copied preserving the hierarchy - build/examples/component/*.html
      {
        expand: true,
        cwd: '<%= dirs.modules %>',
        src: ['coralui-*/<%= dirs.build %>/<%= dirs.examples %>/**/*.*'],
        dest: '<%= dirs.build %>',
        rename: function (dest, src) {
          // rename to replicate component build path
          var srcPath = src.split('/'),
            path = srcPath[srcPath.length - 3],
            component = srcPath[srcPath.length - 2],
            filename = srcPath[srcPath.length - 1];

          return dest + '/' + path +'/' + component + '/' + filename;
        } // /rename
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
