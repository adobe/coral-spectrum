module.exports = function(grunt) {
	grunt.registerMultiTask('jsdoc', 'This builds jsdoc from source files.', function() {
		var config = grunt.config();
		
		var src = grunt.file.expandFiles(this.data.src);
		var dest = grunt.template.process(this.data.dest, config);
		
		var options = {
			done: this.async(),
			script: this.data.script,
			src: src,
			dest: dest
		};
		
		grunt.helper('jsdoc', options);
	});

	grunt.registerHelper('jsdoc', function(options) {
		// jsdoc args
		var args = [
			'-jar',
			'util/jsdoc-toolkit/jsrun.jar',
			'util/jsdoc-toolkit/app/run.js',
			'-a',
			'-t=util/jsdoc-toolkit/templates/jsdoc',
			'-d='+options.dest
		];
		
		// Add source files
		args = args.concat(options.src);
		
		return grunt.utils.spawn(
			{
				cmd: 'java',
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

