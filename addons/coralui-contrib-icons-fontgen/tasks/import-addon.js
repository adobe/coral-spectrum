
module.exports = function(grunt) {

    var dirs = {
        addonsBaseDir: '../',
        modules: 'node_modules/'
    };

    var moduleNames = {
        athenaIcons: 'coralui-contrib-icons-athena'
    };

    /**
    *   Help task, until npm repository is working....
    */
    grunt.registerTask('import-addon', 'Import icons-athena addons', function() {

         grunt.log.writeln('copying coralui-contrib-icons-athena add-on manually');

         grunt.config.set('copy.athena.files',
            [{
                expand:true,
                cwd:(dirs.addonsBaseDir + moduleNames.athenaIcons),
                src:['**'],
                dest:(dirs.modules + moduleNames.athenaIcons)
            }]);

         grunt.file.delete( dirs.modules + moduleNames.athenaIcons );
         grunt.task.run('copy:athena');

         return true;
    });
};
