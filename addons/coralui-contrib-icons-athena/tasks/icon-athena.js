module.exports = function(grunt) {

  // Import and convert icons from athena-zip
  grunt.task.registerTask('icon-athena', [
    'icon-athena-setup',
    'icon-athena-convert'
  ]);

  
  grunt.registerTask('icon-athena-setup', 'This generates a folder with icons from athena.', function() {

    var url = require('url')
    
    grunt.log.ok("icon-athena-setup");

    // where to extract the zip to
    var tmpZipFolder = 'temp/icon-athena/unzip';

    // where to convert files from 
    var convertSrcFolder = tmpZipFolder + "/" + "icons/*"

    // name of download-content
    var tmpDownloadZip = 'temp/icon-athena/download/icons.zip';

    // default: this is the url to the icon for CoralUI hosted in athena
    var iconSourceAthena = "http://theatrix.eur.adobe.com:4502/content/athena/clients/marketingcloud/collections/default.zip";

    var iconsource = grunt.option("is") || grunt.option("iconsource") || iconSourceAthena;

    var tasks = new Array();
    
    grunt.log.ok('searching for icons from athena in ' + iconsource);

    if (url.parse(iconsource).host) {
      grunt.log.ok('url found : ' + iconsource);
      grunt.config.set('curl.long.src', iconsource);
      grunt.config.set('curl.long.dest', tmpDownloadZip);
      grunt.config.set('unzip.catalog.src', tmpDownloadZip);
      grunt.config.set('unzip.catalog.dest', tmpZipFolder);
      grunt.config.set('icon-athena-convert.src', convertSrcFolder);
      tasks.push('curl');
      tasks.push('unzip:catalog');         
    } else if (grunt.file.isFile(iconsource)){
      grunt.log.ok('file found : ' + iconsource);
      grunt.config.set('unzip.catalog.src', iconsource);
      grunt.config.set('unzip.catalog.dest', tmpZipFolder);
      grunt.config.set('icon-athena-convert.src', convertSrcFolder);
      tasks.push('unzip:catalog');
    } else if (grunt.file.isDir(iconsource)){
      grunt.log.ok('directory found : ' + iconsource);
      grunt.config.set('icon-athena-convert.src', iconsource + "/*");
    } else {
      grunt.log.writeln('iconsource could not be found');
      grunt.log.writeln('USAGE: grunt icon-athena -is=<icon .zip>||<icon directory>||<icon url>');
      grunt.log.writeln();
      return false
    }
    
    grunt.task.run(tasks);
    return true;

  });

 
  grunt.registerTask('icon-athena-convert', 'This converts extracted icons from athena into coral ui assets.', function() {
     
    // Expand the list of files
    var config = grunt.config();

    // Process the source name
    var srcConfig = grunt.config('icon-athena-convert.src');

    // Process the destination name
    var dest = grunt.template.process('<%= dirs.build %>/icons/', config);

    grunt.log.ok("converting from "  + srcConfig + " to " + dest);

    var metadataFilename = 'metadata.json';
    var aliasPropertyName =  'athena:alias';
    var assetExtension = '.svg';

    // Get the list of all source files
    var srcFiles = grunt.file.expand(srcConfig);

    // count files
    var count = 0;

    /* for each subfolder */
    srcFiles.forEach(function(src,i) {

      // get alias from metadata.json side-car file
      var metadataJSON = grunt.file.readJSON(src + "/" + metadataFilename);
      var alias = (typeof(metadataJSON[aliasPropertyName]) === 'string') ? [metadataJSON[aliasPropertyName]] : metadataJSON[aliasPropertyName];
      
      grunt.log.ok("converting "  + src);

      // Get the asset in the asset folder
      var assetFiles = grunt.file.expand(src+"/*" + assetExtension);

      // for each asset
      assetFiles.forEach(function(asset){

        var assetName = asset.slice(asset.lastIndexOf('/')+1);
        // get name , copy icon 1:1,             
        grunt.file.copy(asset, dest + assetName);

        // handle alias
        if (alias && Array.isArray(alias)){
          alias.forEach(function(aliasname){
            // copy asset to alias-name
            var aliasDest = dest + aliasname + assetExtension;
            grunt.file.copy(asset, aliasDest);

          });          
        }
            
      });

      count = i+1;
   
    });

    grunt.log.ok(count +' icon(s) successfully imported');
    return true;

  });  
};
