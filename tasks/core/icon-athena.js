module.exports = function(grunt) {

  grunt.loadNpmTasks('grunt-zip');

  // Import and convert icons from athena-zip
  grunt.task.registerTask('icon-athena', [
    'icon-athena-setup',
    'unzip:catalog',
    'icon-athena-convert'
  ]);
  
  grunt.registerTask('icon-athena-setup', 'This generates a folder with icons from athena.', function() {

    var iconsource = grunt.option("is") || grunt.option("iconsource");

    var tmpZipFolder = 'temp/icon-athena';
    
    if (iconsource){

      grunt.log.ok('searching for icons from athena in ' + iconsource);
      
      if (grunt.file.isFile(iconsource)){
        grunt.log.ok('file found : ' + iconsource);
        //set config for "unzip" and "convert"
        grunt.config.set('unzip.catalog.src', iconsource);
        grunt.config.set('unzip.catalog.dest', tmpZipFolder);
        grunt.config.set('icon-athena-convert.src', tmpZipFolder + "/icons/*");
        return true;
      }
      else {
        if (grunt.file.isDir(iconsource)){
          grunt.log.ok('directory found : ' + iconsource);
          grunt.config.set('icon-athena-convert.src', iconsource);
          return true;        
        }
      } 

    }

    grunt.log.writeln('iconsource could not be found');
    grunt.log.writeln('USAGE: grunt <task> -is=<icon .zip>||<icon directory');
    grunt.log.writeln();
    return false;

  });

 
  grunt.registerTask('icon-athena-convert', 'This converts extracted icons from athena into coral ui assets.', function() {
     
    // Expand the list of files
    var config = grunt.config();


    // Process the source name
    var srcConfig = grunt.config('icon-athena-convert.src');

    grunt.log.ok("converting from "  + srcConfig);

    // Process the destination name
    var dest = grunt.template.process('<%= dirs.source %>/images/icons/', config);

    grunt.log.ok("converting from "  + srcConfig + " to " + dest);

    var metadataFilename = 'metadata.json';
    var aliasPropertyName =  'athena:alias';
    var assetExtension = '.svg';

    // Get the list of all source files
    var srcFiles = grunt.file.expand(srcConfig);

    var count = 0;

    /* for each subfolder */
    srcFiles.forEach(function(src,i) {

      // get alias from metadata.json side-car file
      var metadataJSON = grunt.file.readJSON(src + "/" + metadataFilename);
      var alias = (typeof(metadataJSON[aliasPropertyName]) === 'string') ? [metadataJSON[aliasPropertyName]] : metadataJSON[aliasPropertyName]
    

      // Get the asset in the asset folder
      var assetFiles = grunt.file.expand(src+"/*" + assetExtension);

      // for each asset
      assetFiles.forEach(function(asset){

        var assetName = asset.slice(asset.lastIndexOf('/')+1);
        // get name , copy icon 1:1,             
        grunt.file.copy(asset, dest + assetName);

        // for each alias
        alias.forEach(function(aliasname){
          // copy asset to alias-name
          var aliasDest = dest + aliasname + assetExtension;
          grunt.file.copy(asset, aliasDest);

        })
             
      })

      count = i+1;

   
    });

    grunt.log.ok(count +' icon(s) successfully imported');
    return true;

  });  
}    
 