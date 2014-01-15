module.exports = function(grunt) {

  grunt.registerTask('concat-scripts', "Concatenate JavaScript files used for build of CoralUI", function() {
    var config = getConcatConfig();
    grunt.log.writeln ('Concatenate config:', config);
    grunt.config.set('concat.coralui', config);
    grunt.task.run("concat");
  });

  function getConcatConfig() {

    var config = {},
      dirs = grunt.config('dirs');
      package = grunt.config('package');

      config["dest"] = dirs.build + '/' + dirs.js + '/' + package.coral.jsNamespace + '.js';
      config["src"] = [];

      // core compiled js is pulled up from node_modules
      // that is added first, order for core is set in core's package.json
      var coreJsPath = 'node_modules/coralui-core/' + dirs.build + '/' + dirs.js + '/';
      var coreJSFile = package.coral.jsNamespace + '.js';
      grunt.verbose.writeln("Adding", coreJsPath + coreJSFile);
      config.src.push(coreJsPath + coreJSFile);

      // other files are added directly from source files
      // order specified in package.json
      package.coral.order.scripts.forEach( function(fileName) {
        var sourcePath = dirs.build + '/' + dirs.scripts + '/components/';
        grunt.verbose.writeln("Adding", sourcePath + fileName);
        config.src.push(sourcePath + fileName);
      });

    return config;
  }
}
