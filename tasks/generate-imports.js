/*
  This will search the legacy and core directories to make a merged
  components.less file, so we aren't manually creating the
  imports and trying to keep two files in sync
*/
module.exports = function(grunt) {

  grunt.registerTask('generate-imports', 'Generate a less file that imports legacy, core, and components content', function() {

    var config = grunt.config('generate_imports');
   
    var output = '//NOTE: grunt generated file to import all CUI components\n';

    output += '\n//legacy\n';
    var files = grunt.file.expand(config.legacy.src);
    output += addFiles(files, config.output);

    output += '\n//core\n';
    files = grunt.file.expand(config.core.src);
    output += addFiles(files, config.output);

    output += '\n//components\n';
    files = grunt.file.expand(config.components.src);
    output += addFiles(files, config.output);

    grunt.file.write(config.dest, output);
    grunt.log.ok("generated " + config.dest + " from legacy, core, and component styles");
  });


  function addFiles(files, template) {
    var result = '';
    files.forEach(function(file, index) {
      grunt.log.ok("adding " + file);
      file = file.slice(file.lastIndexOf('/')+1);
      result += template.replace('{filename}', file);
      
    });
    return result;
  }

};

