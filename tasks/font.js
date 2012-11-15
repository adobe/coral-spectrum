module.exports = function(grunt) {
  grunt.registerTask('font', 'Builds a font with icons and the corresponding stylesheet.', function() {
    var config = grunt.config();

    var options = {
      done: this.async(),
      src: grunt.template.process(config.font.options.src, config),
      dest_css: grunt.template.process(config.font.options.dest_css, config),
      dest_font: grunt.template.process(config.font.options.dest_font, config)
    };
    
    grunt.helper('font-build', options);
  });

  grunt.registerHelper('font-build', function(options) {

    return grunt.utils.spawn(
      {
        cmd: 'phantomjs',
        args: [
          __dirname+'/fontgen/phantom-runner.js', 
          options.src, 
          options.dest_css, 
          options.dest_font, 
          'tasks/fontgen/res/'
        ]
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