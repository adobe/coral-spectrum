
jQuery(function($) {

  // Automatically populate <code /> samples with the appropriate HTML.
  function populateCodeSamples() {
    // any <code /> blocks that have 'data-src-id' set to a given element
    $('pre[data-src-id]').each(function() {
      var elemNames = $(this).attr('data-src-id').split(",");

      var html = "";

      for (var i=0;i<elemNames.length;i++) {
         html += getElementHTML(elemNames[i]) + "\n\n";
      }
      $(this).text( html );
    });
  }

  function getElementHTML(elemName) {
    var elem = $("#" + elemName);


    // get the html
    var html = elem.html();

    if (! html) {
      console.log('no html found for element:',elemName);
      return null;
    }

    // remove the indent based on the number of spaces prefixing the first line.
    var whitespaceIndentCount = html.search(/[^\s]/);
    var re = new RegExp('^\\s{'+whitespaceIndentCount+'}', 'gm');
    html = html.replace(re, '');

    // replace the spaces
    html = html.replace(/\s*<br>*\s*/g,'\n');

    // sometimes last line has one less space. replace that too.
    re = new RegExp('^\\s{'+(whitespaceIndentCount-1)+'}', 'gm');
    html = html.replace(re, '');

    // replace any trailing whitespace at the end of the lines
    html = html.replace(/\s*$/g, '');

    return html;
  }

  populateCodeSamples();
});
