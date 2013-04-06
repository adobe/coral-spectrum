module.exports = function(grunt) {
  var jsdoc = function(options) {
    // jsdoc args
    var args = [
      '-d',
      options.destination
    ];

    // Add source files
    args = options.src.concat(args);

    if (options.template) {
      args.push('-t', options.template);
    }

    // Dump command:
//    grunt.log.writeln(options.jsdoc + " " + args.join(" "));

    return grunt.util.spawn(
        {
          cmd: options.jsdoc,
          args: args
        },
        function(err, result, code) {
          var success = (code === 0);

          if (success) {
            grunt.log.write(result.stdout);
          } else {
            grunt.log.error(err.stderr);
          }

          grunt.log.writeln();
          options.done(success);
        }
    );
  };

  grunt.registerMultiTask('jsdoc', 'This builds jsdoc from source files.', function() {
    var config = grunt.config();

    var src = grunt.file.expand(this.data.src);
    var destination = this.data.options.destination || "build/jsdoc";
    var template = this.data.options.template || undefined;
    var jsdocCmd = config.dirs.bower + "/jsdoc3/jsdoc";

    var options = {
      done: this.async(),
      src: src,
      destination: destination,
      jsdoc: jsdocCmd,
      template: template
    };

    jsdoc(options);
  });

};

