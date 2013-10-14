(function() {
  // Regex to replace comments added by Illustrator
  var commentRE = /<!--.*?-->\n?/g;
  var badCSSCharsRE = /[^\w-]/g;
  var svgRE = /\.svg$/i;
  var opacityRE = / opacity="[.\d]+"/ig;
  var svgTagRE = /<svg/i;
  var backgroundRE = / enable-background="new[ ]*"/ig;
  var newlineRE = /(\r\n|\n|\r)/g;
  var layerNameRE = / id="Layer_\d+"/i;
  var zeroPXRE = /0px/g;
  
  var psuedoSelector = ':before';
  
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

    // Basic filename transform function
  function getIconName(input) {
    // Remove path
    input = input.slice(input.lastIndexOf('/')+1);
    
    // Remove extension
    input = input.replace(svgRE, '');
    
    return input;
  }
  
  // Remove any chars that could break the CSS classname
  function sanitizeCSSClass(input) {
    return input.replace(badCSSCharsRE, '');
  }

  module.exports = function(grunt) {
    grunt.registerMultiTask('iconCSS', 'This generates a CSS file from SVGs.', function() {
      // Expand the list of files
      var config = grunt.config();
    
      // Get configuration
      var classPrefix = this.data.prefix || 'icon-';
      var transformClassName = this.data.transform || getCSSClassFromFileName;

      // Process the destination name
      var dest = grunt.template.process(this.data.dest, config);

      var htmlTemplate = grunt.template.process(this.data.template, config);
    
      // Get the list of all source files
      var srcFiles = grunt.file.expand(this.data.src);
    
      var colors = this.data.colors || { base: {} };
    
      var outputCSS = '';
      var outputHTML = '';
      
      // Get each file
      srcFiles.forEach(function(src) {
        var svgDataURIPrefix = "data:image/svg+xml;base64,";

        // Read the SVG file in
        var svgFileContents = grunt.file.read(src, 'utf8').toString();
      
        // Strip comments
        svgFileContents = svgFileContents.replace(commentRE, '');
      
        // Remove opacity
        //svgFileContents = svgFileContents.replace(opacityRE, '');
        
        // Remove background tag
        svgFileContents = svgFileContents.replace(backgroundRE, '');
        
        // Remove newlines
        svgFileContents = svgFileContents.replace(newlineRE, '');
      
        // Remove/normalize arbitrary layer names
        svgFileContents = svgFileContents.replace(layerNameRE, ' id="icon"');
       
        // Make zero unitless
        svgFileContents = svgFileContents.replace(zeroPXRE, '0');
        
        // Get the corresponding CSS class name
        var className = sanitizeCSSClass(transformClassName(src));
      
        var additionalClass = '';
        
        for (var color in colors) {
          var colorInfo = colors[color];
          if (color !== 'base') {
            additionalClass = '.'+color;
          }
        
          var otherSelectors = colorInfo.otherSelectors || [];
          
          var newFileContents = svgFileContents;
          if (colorInfo.color)
            newFileContents = newFileContents.replace(svgTagRE, '<svg fill="'+colorInfo.color+'"');
          
          // Create the data URI
          var encoded = svgDataURIPrefix + (new Buffer(newFileContents).toString('base64'));
          
          // TODO: Create states for each opacity
          
          var baseClass = '.'+classPrefix+className;
          
          var selectors = [
            baseClass+additionalClass+psuedoSelector
          ];
          
          // Add additional selectors
          otherSelectors.forEach(function(selectorInfo) {
            selectors.push(selectorInfo.tag+baseClass+selectorInfo.selector+psuedoSelector);
          });
          
          // Add CSS
          outputCSS += selectors.join(',')+' {background-image:url("'+encoded+'") !important;}\n';

          // Add HTML
          outputHTML += '<tr>\n'+
              '\t<td><i class="' + classPrefix+className + ' large"></i></td>\n' +
              '\t<td>' + getIconName(src) + '</td>\n' +
              '\t<td>.' + classPrefix+className + '</td>\n' +
            '</tr>\n';
        }
      });
    
      grunt.log.ok('CSS created for '+srcFiles.length+' icons');
    
      // Write out the CSS file
      grunt.file.write(dest, outputCSS);

      grunt.file.write(htmlTemplate, outputHTML);
    
      return true;
    });
  };
}());