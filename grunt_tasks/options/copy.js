// Copy Grunt Task Configuration
module.exports = {

  component_stylus: {
    files: [
      {
        expand: true,
        // goes into the modules folder.
        cwd: '<%= dirs.modules %>',
        // copies the less files
        src: ['coralui-component-*/build/styles/**/**.styl'],
        dest: '<%= dirs.build %>/styles',
        rename: function (dest, src) {
          return dest + '/components/' + src.replace('build/styles/', '').replace('coralui-component-', '');
        }
      }
    ]
  },

 commons_stylus: {
    files: [
      {
        expand: true,
        // goes into the modules folder.
        cwd: '<%= dirs.modules %>',
        // copies the less files
        src: ['coralui-commons/build/styles/**/**.styl'],
        dest: '<%= dirs.build %>/styles',
        rename: function (dest, src) {
          return dest + '/' + src.replace('build/styles/', '');
        }
      }
    ]
  },

 core_stylus: {
    files: [
      {
        expand: true,
        // goes into the modules folder.
        cwd: '<%= dirs.modules %>',
        // copies the less files
        src: ['coralui-core/build/styles/**/**.*'],
        dest: '<%= dirs.build %>/styles',
        rename: function (dest, src) {
          return dest + '/' + src.replace('build/styles/', '');
        }
      }
    ]
  },

  // component_css: {
  //   files: [
  //     // copies the css files. All files are copied in the same level
  //     // css is flat so examples will still work
  //     {
  //       expand: true,
  //       // goes into the modules folder.
  //       cwd: '<%= dirs.modules %>/',
  //       src: ['*/build/css/**.css'],
  //       dest: '<%= dirs.build %>/css',
  //       flatten: true
  //     }
  //   ]
  // },

  component_examples: {
    files: [
      // copies all the examples. They are copied preserving the hierarchy.
      {
        expand: true,
        cwd: '<%= dirs.modules %>',
        src: ['*/build/examples/**/*.*'],
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

  component_scripts: {
    files: [
      // copies js source files
      {
        expand: true,
        cwd: '<%= dirs.modules %>/',
        src: ['*/build/scripts/*.js'],
        dest: '<%= dirs.build %>/<%= dirs.scripts %>/components/',
        // rename to get only dest + filename
        rename: function (dest, src) {
          var srcPath = src.split('/'),
              filename = srcPath[srcPath.length - 1];
          return dest + '/' + filename;
        }
      }
    ]
  },
  core_scripts: {
    files: [
     // copies js externals files
      {
        expand: true,
        flatten: true,
        cwd: '<%= dirs.modules %>/',
        src: ['*/build/js/libs/*.js'],
        dest: '<%= dirs.build %>/js/libs'
        // // rename to get only dest + folder + filename
        // rename: function (dest, src) {
        //   var srcPath = src.split('/'),
        //       folder = srcPath[srcPath.length - 2];
        //       filename = srcPath[srcPath.length - 1];
        //   return dest + '/' + folder + '/' + filename;
        // }
      },
      // copies js source files
      {
        expand: true,
        cwd: '<%= dirs.modules %>/',
        src: ['*/build/scripts/core/**/*.js'],
        dest: '<%= dirs.build %>/<%= dirs.scripts %>/',
        // rename to get only dest + filename
        rename: function (dest, src) {
          var srcPath = src.split('/'),
              filename = srcPath[srcPath.length - 1];
          return dest + '/' + filename;
        }
      },
    ]
  },
  tests: {
    files: [
      {
        expand: true,
        flatten: true,
        cwd: '<%= dirs.modules %>/',
        src: ['*/build/tests/test.*.js'],
        dest: '<%= dirs.build %>/tests'
      }
    ]
  }

}
// end copy
