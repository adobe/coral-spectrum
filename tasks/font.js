module.exports = function(grunt) {
  grunt.registerTask('font', 'Builds a font with icons and the corresponding stylesheet.', function() {
    var config = grunt.config();

    var options = {
      done: this.async(),
      src: grunt.template.process(config.font.options.src, config),
      dest_css: grunt.template.process(config.font.options.dest_css, config),
      dest_font: grunt.template.process(config.font.options.dest_font, config),
      dest_css_name: grunt.template.process(config.font.options.dest_css_name, config),
      dest_font_name: grunt.template.process(config.font.options.dest_font_name, config),
      prefix: grunt.template.process(config.font.options.prefix, config)
    };
    
    grunt.helper('font-build', options);
  });

  grunt.registerHelper('font-build', function(options) {

    return grunt.utils.spawn( // test if fontforge is installed
      {
        cmd: 'fontforge',
        args: [
          '-c', 
          ' '
        ]
      },
      function(err, result, code) {
        var success = (code == 0);
      
        if (success) {
          grunt.log.write(result.stdout);
          grunt.helper('font-svg', options);
        }
        else {
          grunt.log.write('REMARK: fontforge could not be found, reuse fonts from repository.');
          grunt.log.writeln();
          options.done(true);
        }

      }
    );
  });

  grunt.registerHelper('font-svg', function(options) {

    return grunt.utils.spawn(
      {
        cmd: 'phantomjs',
        args: [
          __dirname+'/fontgen/phantom-runner.js', 
          options.src,
          options.dest_css,
          options.dest_css_name,
          options.dest_font,
          options.dest_font_name,
          options.prefix
        ]
      },
      function(err, result, code) {
        var success = (code == 0);
      
        if (success) {
          grunt.log.write(result.stdout);
          // execute conversion after the SVG font is generated
          grunt.helper('font-convert', options);
        }
        else {
          grunt.log.error(err.stderr);
        }

        grunt.log.writeln();
      }
    );
  });

  grunt.registerHelper('font-convert', function(options) {
    return grunt.utils.spawn(
      {
        cmd: 'fontforge',
        args: [
          '-script',
          __dirname+'/fontgen/convert.pe', 
          options.dest_font + options.dest_font_name
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
      });
  });

};