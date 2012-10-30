(function() {
  // Regex to replace comments added by Illustrator
  var commentRE = /<!--.*?-->\n?/g;
  var badCSSCharsRE = /[^\w-]/g;
  var svgRE = /\.svg$/i;

  // Basic filename transform function
  function getCSSClassFromFileName(input) {
    // Remove path
    input = input.slice(input.lastIndexOf('/')+1);
    
    // Remove extension
    input = input.replace(svgRE, '');
    
    // Lowercase first char
    input = input.slice(0,1).toLowerCase()+input.slice(1);
    
    return input;
  }
  
  // Remove any chars that could break the CSS classname
  function santizeCSSClass(input) {
    return input.replace(badCSSCharsRE, '');
  }

  module.exports = function(grunt) {
    grunt.registerMultiTask('icons', 'This generates a CSS file from SVGs.', function() {
      // Expand the list of files
      var config = grunt.config();
    
      // Get configuration
      var classPrefix = this.data.prefix || 'icon-';
      var transformClassName = this.data.transform || getCSSClassFromFileName;

      // Process the destination name
      var dest = grunt.template.process(this.data.dest, config);
    
      // Get the list of all source files
      var srcFiles = grunt.file.expand(this.data.src);
    
      var outputCSS = '';
      
      // Get each file
      srcFiles.forEach(function(src) {
        var svgDataURI = "data:image/svg+xml;base64,";

        // Read the SVG file in
        var svgFileContents = grunt.file.read(src, 'utf8').toString();
      
        // Strip comments
        svgFileContents.replace(commentRE, '');
      
        // Get the corresponding CSS class name
        var className = santizeCSSClass(transformClassName(src));
      
        // Create the data URI
        var encoded = svgDataURI + (new Buffer(svgFileContents).toString('base64'));
      
        outputCSS += '.'+classPrefix+className+' {background-image:url("'+encoded+'") !important;}\n';
      });
    
      grunt.log.ok('CSS created for '+srcFiles.length+' icons');
    
      // Write out the CSS file
      grunt.file.write(dest, outputCSS);
    
      return true;
    });
  };
}());