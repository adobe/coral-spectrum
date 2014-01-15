module.exports = function(grunt) {

  var config = grunt.config.get();

  grunt.registerTask('compile-css', "Compiles stylus into the css for CoralUI", function() {

    var tasks = []
    concatCSS(tasks);
    cssMin(tasks);

    grunt.task.run(tasks);

    // grunt.config.set('stylus.compile',{
    //   options: {
    //     urlfunc: 'embedurl'
    //   }
    // });

    // grunt.config.set('stylus.compile.options.paths', [config.dirs.build + '/' + config.dirs.styles + '/']);

    // grunt.config.set('stylus.compile.options.import', [
    //   'nib',
    //   'coralui-commons/globals',
    //   'coralui-commons/colors',
    //   'coralui-commons/colors.dark',
    //   'coralui-commons/layers',
    //   'coralui-commons/mixins'
    // ]);

    // var sourceFiles = [];
    // sourceFiles = sourceFiles.concat(getCoreStyles());
    // sourceFiles = sourceFiles.concat(getComponentStyles());

    // var filesConfig =  {
    //   src: sourceFiles,
    //   dest: config.dirs.build + '/' + config.dirs.css + '/' + config.package.name +'.css'
    // };

    // grunt.log.writeln("Files definition for stylus:", filesConfig);

    // grunt.config.set('stylus.compile.files', [filesConfig]);

    // grunt.task.run('stylus:compile');

  });


  function concatCSS(tasks) {

    var concatSrc = [];

    concatSrc.push('node_modules/coralui-core/build/css/coralui-core.css');

    config.package.coral.order["component-css"].forEach( function (componentName) {
      var cssPath =  config.dirs.build + '/' + config.dirs.css + '/' + componentName +'.css'
      concatSrc.push('node_modules/' + componentName + '/' +  cssPath);
    });

    grunt.config.set('concat', {
      "coralui-css":
        {
          src: concatSrc,
          dest: config.dirs.build + '/' + config.dirs.css + '/' + config.package.name +'.css'
        }
    });

    tasks.push('concat:coralui-css');
  }

  function cssMin(tasks) {

    grunt.config.set('cssmin.coralui.files',
      [{
      src: 'build/css/coralui.css',
      dest: 'build/css/coralui.min.css'
    }]);

    tasks.push('cssmin:coralui');
  }

  // function getCoreStyles() {
  //   var coreConfig = grunt.file.readJSON('node_modules/coralui-core/package.json');
  //   var styles = coreConfig.coral.order.styles.default;
  //   styles = styles.concat(coreConfig.coral.order.styles.icons);

  //   // TODO: optionally add dark, form, etc
  //   styles = styles.concat(coreConfig.coral.order.styles.dark);
  //   styles = styles.concat(coreConfig.coral.order.styles.form);

  //   var result = [];
  //   styles.forEach( function(item){
  //     result.push(
  //       config.dirs.build + '/'
  //       + config.dirs.styles
  //       + '/coralui-core/'
  //       + item.replace('styles/', '')
  //     );
  //   });
  //   return result;
  // }

  // function getComponentStyles() {
  //   return grunt.file.expand(
  //     config.dirs.build + '/'
  //     + config.dirs.styles + '/'
  //     + config.dirs.components + '/**/*.styl'
  //   );
  // }


}
