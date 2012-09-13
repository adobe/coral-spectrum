module.exports = function(grunt) {
  grunt.registerMultiTask('jsdoc', 'This builds jsdoc from source files.', function() {
    var config = grunt.config();
    
    var src = grunt.file.expandFiles(this.data.src);
    var dest = grunt.template.process(this.data.dest, config);
    var jsdoc = grunt.template.process(this.data.jsdoc, config);
    
    var options = {
      done: this.async(),
      src: src,
      dest: dest,
      jsdoc: jsdoc
    };
    
    grunt.helper('jsdoc', options);
  });

  grunt.registerHelper('jsdoc', function(options) {
    // jsdoc args
    var args = [
      '-d',
      options.dest
    ];
    
    // Add source files
    args = args.concat(options.src);
    
    return grunt.utils.spawn(
      {
        cmd: options.jsdoc,
        args: args
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

