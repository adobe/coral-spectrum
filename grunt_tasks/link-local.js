module.exports = function(grunt) {

  grunt.registerTask('link-local', "Runs 'npm link' for developing coralui packages locally", function() {

    var dirs = grunt.config('dirs');
    var coralPackages = grunt.file.expand( { cwd: dirs.packages },'coralui-co*')
    grunt.log.ok("Found " + coralPackages.length + " packages to link");

    coralPackages.forEach( function (pkgName) {
      grunt.verbose.writeln('link-local setting command:', 'npm link ' + dirs.packages + "/" + pkgName);

      var cmdString = 'npm link ' + dirs.packages + "/" + pkgName;

      // extra linking for components and core
      if ( pkgName.indexOf('commons') == -1 ) {
        cmdString += ' && cd ';
        cmdString += dirs.packages + "/" + pkgName;
        cmdString += ' && npm link ../coralui-commons';

        // just components link to core
        if ( pkgName.indexOf('core') == -1 ) {
          cmdString += ' && npm link ../coralui-core'
        }
      }

      grunt.config.set('shell.npmLink-' + pkgName, {
        command: cmdString,
        options: { stdout:true}
      });

      grunt.log.ok("Linking: " + pkgName);
      grunt.task.run('shell:npmLink-' + pkgName);
    });

  }); // end link-local
}
