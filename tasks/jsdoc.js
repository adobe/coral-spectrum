module.exports = function(grunt) {
  grunt.registerMultiTask('jsdoc', 'This builds jsdoc from source files.', function() {
    var config = grunt.config();
    
    var src = grunt.file.expandFiles(this.data.src);
    var dest = grunt.template.process(this.data.dest, config);
    var jsdoc = grunt.template.process(this.data.jsdoc, config);
    var template = this.data.template ? grunt.template.process(this.data.template, config) : undefined;
    
    var options = {
      done: this.async(),
      src: src,
      dest: dest,
      jsdoc: jsdoc,
      template: template
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
    args = options.src.concat(args);
    
    if (options.template) {
      // args.push('-t', process.cwd()+'/'+options.template); // creates 19 folders...
      // args.push('-t', '../../'+options.template);  // doesn't work
      args.push('-t', options.template);
    }
    
    // Dump command:
    // console.log(options.jsdoc+' '+args.join(" "));
    
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

