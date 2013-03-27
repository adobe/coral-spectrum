module.exports = function(grunt) {

  // convert to array type, if necessary
  function toArray(input) {
    if (typeof(input) === 'string') {
        return [input];
    } else {
        return input;
    }
  }  

  grunt.registerTask('athenaimport', 'This generates a folder with icons from athena.', function() {

    var iconsource = grunt.option("is") || grunt.option("iconsource");

    var tmpZipFolder = 'temp/athena-icons';
    
    if (iconsource){

      grunt.log.ok('searching for athena-icons in ' + iconsource);
      
      if (grunt.file.isFile(iconsource)){
        grunt.log.ok('file found : ' + iconsource);
        //set config for "unzip" and "convert"
        grunt.config.set('athena.unzip.src', iconsource);
        grunt.config.set('athena.unzip.dest', tmpZipFolder);
        grunt.config.set('athena.convert.src', tmpZipFolder + "/icons/*");
        return true;
      }
      else {
        if (grunt.file.isDir(iconsource)){
          grunt.log.ok('directory found : ' + iconsource);
          grunt.config.set('athena.convert.src', iconsource);
          return true;        
        }
      } 

    }

    grunt.log.writeln('iconsource could not be found');
    grunt.log.writeln('USAGE: grunt <task> -is=<icon .zip>||<icon directory');
    grunt.log.writeln();
    return false;

  });

 
  grunt.registerMultiTask('athenaconvert', 'This generates a folder with icons from athena.', function() {
     
    // Expand the list of files
    var config = grunt.config();


    // Process the source name
    var srcConfig = this.data.src;


    // Process the destination name
    var dest = grunt.template.process(this.data.dest, config);

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
      var alias = toArray(metadataJSON[aliasPropertyName]);
    

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
 