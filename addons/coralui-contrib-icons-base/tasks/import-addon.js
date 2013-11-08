
module.exports = function(grunt) {

    var dirs = {
        addonsBaseDir: '../',
        modules: 'node_modules/'
    };

    var moduleNames = {
        iconFontGenAddon: 'coralui-contrib-icons-fontgen'
    };

    /**
    *   Help task, until npm repository is working....
    */
    grunt.registerTask('import-addon', 'Import coralui-contrib-icons-fontgen add-on', function() {

         grunt.log.writeln('copying coralui-contrib-icons-fontgen add-on manually');

         grunt.config.set('copy.iconFontGenAddon.files',
            [{
                expand:true,
                cwd:(dirs.addonsBaseDir + moduleNames.iconFontGenAddon),
                src:['**'],
                dest:(dirs.modules + moduleNames.iconFontGenAddon)
            }]);

         grunt.file.delete( dirs.modules + moduleNames.iconFontGenAddon );
         grunt.task.run('copy:iconFontGenAddon');

         return true;
    });
};
