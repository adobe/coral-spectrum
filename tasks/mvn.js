module.exports = function(grunt) {
  grunt.registerTask('mvn', 'This builds a CRX content package and installs it to your local Maven repository and local Granite instance.', function() {
    var config = grunt.config();
    
    var options = {
      done: this.async()
    };
    
    grunt.helper('mvn-install', options);
  });

  grunt.registerHelper('mvn-install', function(options) {
    return grunt.utils.spawn(
      {
        cmd: 'mvn',
        args: ['clean', 'install', 'content-package:install']
      },
      function(err, result, code) {
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
  });
};

