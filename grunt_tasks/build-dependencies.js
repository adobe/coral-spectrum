module.exports = function(grunt) {

  grunt.registerTask('build-dependencies', "Builds specified packages into CoralUI", function() {
    var tasks = getSubgruntTasks();
    grunt.log.writeln ('Subgrunt targets are:', tasks);
    grunt.config.set('subgrunt', tasks);
    grunt.task.run("subgrunt");
  });

  function getSubgruntTasks() {


    var subgruntTasks = {},
      dirs = grunt.config('dirs'),
      fileName = grunt.config('build-dependencies.buildTargetsFileName'),
      filePath = grunt.config('build-dependencies.buildTargetsFilePath'),
      jsonFilePath = filePath + fileName,
      buildTargetsKey = grunt.config('build-dependencies.buildTargetsKey'),
      subgruntTarget = grunt.config('build-dependencies.subgruntTarget');

    grunt.verbose.writeln('Subgrunt target is:', subgruntTarget)

    if (grunt.file.exists(jsonFilePath)) {
      grunt.verbose.writeln("build-dependencies found ", jsonFilePath);
      buildTargetsJson = grunt.file.readJSON(jsonFilePath);

      for (var key in buildTargetsJson[buildTargetsKey]) {
        subgruntTasks[key] = {};
        subgruntTasks[key][dirs.modules + '/' +  key] = subgruntTarget;
        grunt.verbose.writeln("Subgrunt will build:", key);
      }
    } else {
      grunt.fail.warn("build-dependencies did not find", jsonFilePath);
    }


    return subgruntTasks;
  }
}
