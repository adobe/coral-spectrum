module.exports = function (grunt) {
  var coverage = function (options) {
    return grunt.util.spawn(
        {
          cmd: __dirname + '/../util/genCoverageReport.sh', // TODO: replace this with something more sane
          args: []
        },
        function (err, result, code) {
          var success = (code == 0);

          if (success) {
            grunt.log.write(result.stdout);
          }
          else {
            grunt.log.error(err.stderr);
          }

          grunt.log.writeln();
          options.done(success);
        }
    );
  };

  grunt.registerTask('coverage', 'This runs tests and builds a code coverage report', function () {
    var config = grunt.config();
    var options = {
      done: this.async()
    };

    coverage(options);
  });

};
