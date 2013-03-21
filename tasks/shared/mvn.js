module.exports = function (grunt) {
  var mvn = function (options) {
    var command = grunt.util.spawn(
        {
          cmd: 'mvn',
          args: options.goals
        },
        function (err, result, code) {
          options.done((code === 0));
        }
    );

    command.stdout.on('data', function (data) {
      grunt.log.writeln(data);
    });

    command.stderr.on('data', function (data) {
      grunt.log.error(data);
    });
  };

  grunt.registerMultiTask('mvn', 'This performs a Maven goal.', function () {
    mvn({
      goals: this.data.args,
      done: this.async()
    });
  });

};
