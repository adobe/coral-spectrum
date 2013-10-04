/*global module:false*/
module.exports = function(grunt) {
  /**
    Build directories
    Any directories used by the build should be defined here
  */
  var dirs = {
    build: 'build',
    source: 'source',
    temp: 'temp',
    modules: 'node_modules',
    tasks: 'tasks'
  };

  grunt.loadTasks('tasks');

  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-copy');

  // Read in package.json
  var pkg = grunt.file.readJSON('package.json');

  // Meta and build configuration
  var meta = {
      version: pkg.version,
      appName: pkg.name,
      appWebSite: pkg.repository.url
  };

  grunt.initConfig({

    dirs: dirs,
    meta: meta,
    outputFileName: "icons",

    // Task definitions
    clean: {
      build: '<%= dirs.build %>',
      temp: '<%= dirs.temp %>'
    }, // clean

    'icon-athena': {
      options: {
        variants: [{name:'16', replace:'', dest:'16'},{name:'24', replace:'', dest:'24'}]
      },
      monochrome: {
        options: {
          muh: 'monochrome-muh',
          downloadZip: 'clouduigeneral.zip',
          tmpZipFolder: 'temp/icon-athena/unzip/monochrome'
        }
      },      
      color: {
        options: {
          muh: 'color-muh',
          downloadZip: 'clouduicolor.zip',
          tmpZipFolder: 'temp/icon-athena/unzip/color'
        }
      },      
      hover: {
        options: {
          muh: 'hover-muh',
          downloadZip: 'clouduiwithhover.zip',
          tmpZipFolder: 'temp/icon-athena/unzip/hover',
          variants: [
                    {name:'Light16', replace:'_Light', dest:'16'},
                    {name:'Light24', replace:'_Light', dest:'24'},
                    {name:'Active16', replace:'_Active', dest:'16'},
                    {name:'Active24', replace:'_Active', dest:'24'},
                    {name:'Dark16', replace:'_Dark', dest:'16'},
                    {name:'Dark24', replace:'_Dark', dest:'24'}
                    ]
        }
      }            
    } // icon-athena

  });
  // end init config

  // Default
  grunt.task.registerTask('default', [
    'clean',
    'icon-athena'
  ]);
};
