/*
  This will search the legacy and core directories to make a merged
  components.less file, so we aren't manually creating the
  imports and trying to keep two files in sync
*/
module.exports = function(grunt) {

  grunt.registerTask('generate-imports', 'Generate a less file that imports all core components', function() {

    var config = grunt.config('generate_imports');
   
    var output = '//NOTE: grunt generated file to import all CUI components\n';

    output += '\n//core\n';
    files = grunt.file.expand(config.core.src);
    output += addFiles(files, config.output);

    grunt.file.write(config.dest, output);
    grunt.log.ok("generated " + config.dest + " core component styles");
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

