module.exports = function(grunt) {

  grunt.loadNpmTasks('grunt-zip');
  grunt.loadNpmTasks('grunt-curl');

  // property for icon-athena
  var url = require('url');
  var baseUrl = 'http://theatrix.eur.adobe.com:4502/content/athena/clients/cloud-ui/collections/';
  var downloadDestFolderBase = 'temp/icon-athena/download';
  var unzipDestFolderBase = 'temp/icon-athena/unzip';

  // Import and convert icons from athena-zip
  grunt.registerMultiTask('icon-athena', 'This generates a folder with icons from athena.', function() {

    var config = grunt.config();

    var options = this.options();

    // where to extract the zip to
    var tmpZipFolder = options.tmpZipFolder;
    grunt.verbose.ok('tmpZipFolder: ' + tmpZipFolder);

    // where to convert files from 
    var convertSrcFolder = tmpZipFolder + "/" + "icons/*";
    grunt.verbose.ok('convertSrcFolder: ' + convertSrcFolder);    

    // name of download-content
    var downloadDest = downloadDestFolderBase + "/" + options.downloadZip;
    grunt.verbose.ok('downloadDest: ' + downloadDest);

    // default: this is the url to the icon for CoralUI hosted in athena
    var downloadSrc = baseUrl + options.downloadZip;
    
    grunt.log.ok('searching for icons from athena in ' + downloadSrc);
   
    if (url.parse(downloadSrc).host) {
      grunt.log.ok('url found : ' + downloadSrc);    
    } else {
      grunt.log.writeln('Icons on Athena could not be found');
      grunt.log.writeln();
      return false
    }

    // config curl
    grunt.config.set('curl.' + this.target, {
        src: downloadSrc,
        dest: downloadDest
    });

    // run curl
    grunt.task.run('curl:' + this.target);
    grunt.verbose.ok('downloading icons from ' + downloadSrc + ' to ' + downloadDest);  

    // config unzip
    grunt.config.set('unzip.' + this.target, {
        src: downloadDest,
        dest: tmpZipFolder
    });

    //run unzip
    grunt.log.ok('NOTE: unzip task may take a while (5 minutes)...');
    grunt.task.run('unzip:' + this.target);
    grunt.verbose.ok('extracting icons from ' + downloadDest + ' to ' + tmpZipFolder);

    // config converting
    var configConvertSrcName = 'icon-athena-convert.' + this.target + '.src';    
    grunt.config.set(configConvertSrcName, convertSrcFolder);

    var variants = options.variants;
    grunt.config.set('icon-athena-convert.' + this.target + '.variants',  options.variants);

    // run converting 
    grunt.task.run('icon-athena-convert:' + this.target);

    return true;

  });

  // property for icon-athena-convert 
  var metadataFilename = 'metadata.json';
  var aliasPropertyName =  'athena:alias';
  var assetExtension = '.svg';

  grunt.registerMultiTask('icon-athena-convert', 'This converts extracted icons from athena into coral ui assets.', function() {
     
    // get the variants from config
    var variants = grunt.config('icon-athena-convert.' + this.target).variants;

    // get the src to convert from
    var convertSrc = this.file.src;

    // Process the destination name
    var config = grunt.config();
    var convertDest = grunt.template.process('<%= dirs.build %>/' + this.target + '/', config);
    grunt.verbose.writeln("converting all files from "  + convertSrc + " to " + convertDest);

    // Get the list of all source files
    var srcFiles = grunt.file.expand(convertSrc);
    var count = processIcons(srcFiles, convertDest, variants);

    grunt.log.ok(count +' icon(s) successfully imported');

    return true;
  });  
  
  /**
  * one icon/source has multiple assets 
  */
  function processIcons(srcFiles, convertDest, variants) {

    // count files
    var count = 0;

    /* for each subfolder */
    srcFiles.forEach(function(src,i) {

      // get alias from metadata.json side-car file
      var metadataJSON = grunt.file.readJSON(src + "/" + metadataFilename);
      var aliasValue = (typeof(metadataJSON[aliasPropertyName]) === 'string') ? [metadataJSON[aliasPropertyName]] : metadataJSON[aliasPropertyName];
      
      // Get the asset in the asset folder by variant : 16 & 24
      variants.forEach(function(variant) {
        var assetFiles = grunt.file.expand(src+"/*_*"+variant.name+assetExtension);
        processAssets(assetFiles, variant, convertDest, aliasValue);
      });

      count = i+1;
   
    });    

    return count;
  };


  function processAssets(assets, variant, convertDest, alias) {

    assets.forEach(function(asset){
      // get asset name
      var assetName = asset.slice(asset.lastIndexOf('/')+1);
      // remove variant from assetName
      assetName = assetName.replace('_'+variant.name, variant.replace);
      assetDest = convertDest + variant.dest + '/';
      // get name , copy icon 1:1,             
      grunt.file.copy(asset, assetDest + assetName);
      grunt.verbose.ok("copy " + asset + " to " + assetDest);

      // handle alias
      if (alias && Array.isArray(alias)){
        alias.forEach(function(aliasname){
          // copy asset to alias-name
          var aliasDest = assetDest + aliasname + assetExtension;
          grunt.file.copy(asset, aliasDest);

        });          
      }   
    })
  };

 

};
