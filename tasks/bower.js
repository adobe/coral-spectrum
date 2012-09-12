module.exports = function(grunt) {
	grunt.registerMultiTask('bower', 'Installs dependencies using Bower.', function() {
		grunt.helper('bower', ['install']);
	});

	grunt.registerMultiTask('bower:update', 'Updates dependencies using Bower.', function() {
		grunt.helper('bower', ['update']);
	});

	grunt.registerHelper('bower', function(options) {
		// TBD: find bower in node_modules if command doesn't exist
		
		return grunt.utils.spawn(
			{
				cmd: 'bower',
				args: options
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

