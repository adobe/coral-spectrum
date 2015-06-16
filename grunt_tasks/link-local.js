module.exports = function(grunt) {

  grunt.registerTask('link-local', "Runs 'npm link' for developing coralui packages locally", function() {

    var targets = grunt.option('link-targets');

    var dirs = grunt.config('dirs');
    var commonsPath = dirs.packages + '/' + dirs.commons;
    var corePath = dirs.packages + '/' + dirs.core;
    var componentsPath = dirs.packages + '/' + dirs.components;
    var coralComponents = [];

    grunt.verbose.writeln("Targets:", targets);

    if (!targets) {
      grunt.log.ok('No argument given, cannot link compnents ...');
      grunt.log.writeln('  Pass arguments using --link-targets=');
      grunt.log.writeln('  Targets can be a component name or a comma separated list of component names');
      grunt.log.writeln('  Use --link-targets=all to link all components');
    }
    else {

      if (targets.toLowerCase() === 'all') {
        coralComponents = grunt.file.expand({
          cwd: componentsPath
        }, '*');
      }
      else {
        coralComponents = grokTargets(targets);
      }
      grunt.log.writeln("Found " + coralComponents.length + " components to link");
    }

    // link commons a core to top level
    npmLink(dirs.packages, 'commons');
    npmLink(dirs.packages, 'core');

    coralComponents.forEach(function(pkgName) {
      var path = dirs.packages + "/" + dirs.components;
      // set extra shell instructions
      // to link component core and commons
      var extraCommands = ' && cd ';
      extraCommands += path + "/" + pkgName;
      extraCommands += ' && npm link ../../commons';
      extraCommands += ' && npm link ../../core';

      npmLink(path, pkgName, extraCommands);
    });
  }); // end link-local

  function npmLink(path, pkg, extras) {

    grunt.log.ok('Linking:', pkg);
    var cmdString = 'npm link ' + path + '/' + pkg;

    if (extras) {
      cmdString += extras;
    }

    grunt.config.set('shell.npmLink-' + pkg, {
      command: cmdString,
      options: {
        stdout: true
      }
    });

    grunt.task.run('shell:npmLink-' + pkg);
  }

  // create array from CSV, or just push if not CSV
  function grokTargets(targets) {
    var result = [];
    if (targets.indexOf(',') > 0) {
      result = result.concat(targets.split(','));
    }
    else {
      result.push(targets);
    }
    return result;
  }
}
