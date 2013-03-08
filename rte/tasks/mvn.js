module.exports = function (grunt) {
  var mvn = {
    install: function (options) {
      return grunt.util.spawn(
          {
            cmd: 'mvn',
            args: ['clean', 'install', 'content-package:install']
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
    },
    deploy: function (options) {
      return grunt.util.spawn(
          {
            cmd: 'mvn',
            args: ['clean', 'deploy']
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
    }
  };

  grunt.registerTask('mvn-install', 'This builds a CRX content package and installs it to your local Maven repository and local Granite instance.', function () {
    var config = grunt.config();

    var options = {
      done: this.async()
    };

    mvn.install(options);
  });

  grunt.registerTask('mvn-deploy', 'This builds a CRX content package and installs it to your local Maven repository and local Granite instance.', function () {
    var config = grunt.config();

    var options = {
      done: this.async()
    };

    mvn.deploy(options);
  });

};
