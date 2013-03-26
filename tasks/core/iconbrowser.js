(function() {
  
  // Based of icons.js.

  // Regex to replace extensions, and sanitize class names:
  var svgRE = /\.svg$/i;
  var badCSSCharsRE = /[^\w-]/g;

  // Basic filename transform function
  function getCSSClassFromFileName(input) {
    // Remove path
    input = input.slice(input.lastIndexOf('/')+1);
    
    // Remove extension
    input = input.replace(svgRE, '');
    
    // Lowercase filename
    input = input.toLowerCase();
    
    return input;
  }

  // Remove any chars that could break the CSS classname
  function sanitizeCSSClass(input) {
    return input.replace(badCSSCharsRE, '');
  }

  // convert to array type, if necessary
  function toArray(input) {
    if (typeof(input) === 'string') {
        return [input];
    } else {
        return input;
    }
  }  

  module.exports = function(grunt) {
    grunt.registerMultiTask('iconbrowser', 'This generates a JSON file that the icon browser will ingest.', function() {
      
      // Expand the list of files
      var config = grunt.config();
    
      // Get configuration
      var classPrefix = this.data.prefix || 'icon-';
      var transformClassName = this.data.transform || getCSSClassFromFileName;

      // Process the destination name
      var dest = grunt.template.process(this.data.dest, config);

      // Get the list of all source files
      var srcFiles = grunt.file.expand(this.data.src);
    
      var colors = this.data.colors;
    
      var outputJSON = [];

      // Get each file
      srcFiles.forEach(function(src) {
        
        // Get the corresponding CSS class name
        var className = sanitizeCSSClass(transformClassName(src));
      
        var additionalClass = '';
        var selector = classPrefix + className;

        // Add the selector to the JSON array:
        outputJSON.push({selector: selector, file: src.slice(src.lastIndexOf('/')+1)});
      });
    
      grunt.log.ok('Icons list created for '+srcFiles.length+' icons');
    
      // Write out the CSS file
      grunt.file.write(dest, JSON.stringify(outputJSON, null, 2));
    
      return true;
    });


    grunt.registerMultiTask('athena-icons', 'This generates a folder with icons from athena.', function() {
      
      // Expand the list of files
      var config = grunt.config();

      // Process the destination name
      var dest = grunt.template.process(this.data.dest, config);

      var iconsource = grunt.option("is") || grunt.option("iconsource");
      
      if (iconsource){
        grunt.log.writeln('searching for athena-icons in ' + iconsource);
      } else {
        grunt.log.write('REMARK: athena iconsource could not be found, reuse assets from repository.');
        grunt.log.writeln();
        //options.done(true);
        this.async()
        return false;
      }

      var metadataFilename = 'metadata.json';
      var aliasPropertyName =  'athena:alias';
      var assetExtension = '.svg';

      // Get the list of all source files
      var srcFiles = grunt.file.expand(this.data.src);

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
     
      });
  
      grunt.log.ok('Icons created from athena ' + iconsource);
      return true;

    });
    


  };
}());