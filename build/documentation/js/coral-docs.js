jQuery(function($) {

  // Automatically populate <code /> samples with the appropriate HTML.
  function populateCodeSamples()
  {
    // any <code /> blocks that have 'data-src-id' set to a given element
    $('pre[data-src-id]').each(function()
    {
      var elemNames = $(this).attr('data-src-id').split(",");

      var html = "";

      for (var i=0;i<elemNames.length;i++)
      {

        html += getElementHTML(elemNames[i]);
      }
      $(this).text( html );
    });
  }

  function getElementHTML(elemName)
  {
    var elem = $("#" + elemName);


    // get the html
    var html = elem.html();

    if (! html)
    {
      console.log('no html found for element:',elemName);
      return null;
    }

    return indentify(html);
  }

  $('.guide-Example-showMarkup').on('click', function(event){
    var link = $(event.currentTarget);
    toggleHideShowText(link);
    var codeContainer = link.next('.guide-Example-toggleMarkup');
    codeContainer.toggle();
    return false;
  })

  populateCodeSamples();
  prettyPrint();

  function toggleHideShowText(link) {
    var linkText = link.html();
    if (linkText.indexOf('show') > -1) {
      linkText = linkText.replace('show', 'hide');
    } else {
      linkText = linkText.replace('hide', 'show');
    }
    link.html(linkText);
  }

  function indentify(html, indent) {
    indent = indent !== undefined ? indent : 2;

    var lines = html.split("\n");
    var curLine;

    var curLineSpaces = 0;
    var lastLineSpaces = -1;
    var indentLevel = -1;

    var processedLines = []
    for (var i=0; i<lines.length; i++ ) {

      curLine = lines[i];
      curLineSpaces =  curLine.search(/[^\s]/);
      if (curLineSpaces > lastLineSpaces) {
        indentLevel++;
      }
      else if (curLineSpaces < lastLineSpaces) {
        indentLevel--;
      }
      curLine = curLine.replace(/^\s*/, spaces(indentLevel*indent));
      lastLineSpaces = curLineSpaces;

      if ( curLine.length > 0 )
      {
        processedLines.push( curLine );
      }
    }

    //console.log(lines);

    return processedLines.join("\n");
  }

  function spaces(len) {
    var str = "";
    for (var i=0;i<len; i++) {
      str += " ";
    }
    return str;
  }

});
