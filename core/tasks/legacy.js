
module.exports = function(grunt) {

    // Nodejs libs.
    var path = require('path');

    var dirs = {
        addons: '../addons/',
        modules: 'node_modules/'
    };

    var moduleNames = {
        icons:'coralui-contrib-icons-base',
        adobeclean:'coralui-contrib-adobeclean'
    };


    grunt.registerTask('legacy', 'Legacy task to trigger a valid legacy build', function() {

         grunt.log.writeln('copying coralui-contrib addons manually');

         grunt.config.set('copy.icons.files',
            [{
                expand:true,
                cwd:(dirs.addons + moduleNames.icons),
                src:['**'],
                dest:(dirs.modules + moduleNames.icons)
            }]);

           grunt.config.set('copy.adobeclean.files',
            [{
                expand:true,
                cwd:(dirs.addons + moduleNames.adobeclean),
                src:['**'],
                dest:(dirs.modules + moduleNames.adobeclean)
            }]);
         

         grunt.file.delete( dirs.modules + moduleNames.icons );
         grunt.task.run('copy:icons');


         grunt.file.delete( dirs.modules + moduleNames.adobeclean );
         grunt.task.run('copy:adobeclean');

         grunt.log.writeln('succesfully copied coralui-contrib adds-ons');
         return true;
    });
     

};