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
  };
}());