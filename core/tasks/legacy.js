
module.exports = function(grunt) {

    // Nodejs libs.
    var path = require('path');

    var dirs = {
        addons: '../addons',
        modules: 'node_modules'
    };

    grunt.registerTask('legacy', 'Legacy task to trigger a valid legacy build', function() {
        var done = this.async();
        grunt.util.spawn({
            cmd: "cp",
            args: [
                '-r',
                dirs.addons + '/coralui-contrib-icons-base',
                dirs.modules
            ]
        }, function(error, result, code) {
            if (error) {
                grunt.log.error('Error running to copy icon addon: ' + result);
            } else {
                grunt.log.writeln('Successfully copied icon addon');
            }
            done(code === 0);
        });
    });

};