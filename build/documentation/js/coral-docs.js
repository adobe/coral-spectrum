jQuery(function($) {

  // Automatically populate <code /> samples with the appropriate HTML.
  function populateCodeSamples() {
    // any <code /> blocks that have 'data-src-id' set to a given element
    $('pre[data-src-id]').each(function() {
      var elemNames = $(this).attr('data-src-id').split(",");

      var html = "";

      for (var i=0;i<elemNames.length;i++) {
        html += getElementHTML(elemNames[i]);
      }
      $(this).text( html );
    });
  }

  // binds the click event to any docs-ThemeSwitcher-button in the document
  $(document).on('click', '.docs-ThemeSwitcher-button', function(event) {

    // gets the closes section where the theme change will be applied
    var section = $(event.currentTarget).closest('.docs-Example-section');

    // deselects all the buttons
    section.find('.docs-ThemeSwitcher-button').removeClass('is-selected');
    // selects the current one
    $(event.currentTarget).addClass('is-selected');

    // removes the theme
    section.removeClass('coral--dark');
    section.removeClass('coral--light');

    // adds the theme specified by the button
    if($(event.currentTarget).data('theme')) {
      section.addClass($(event.currentTarget).data('theme'));
    }
  });

  function getElementHTML(elemName) {
    var elem = $("#" + elemName);

    // get the html
    var html = elem.html();

    if (! html) {
      console.log('no html found for element:',elemName);
      return null;
    }

    // return modified booleans in html to their
    // original html5 markup shorthand
    html = fixBooleanAttributes(html);

    return indentify(html);
  }

  $('.docs-Example-showMarkup').on('click', function(event) {
    var link = $(event.currentTarget);
    toggleHideShowText(link);
    var codeContainer = link.next('.docs-Example-toggleMarkup');
    codeContainer.toggle();
    return false;
  })

  populateCodeSamples();
  prettyPrint();

  function fixBooleanAttributes(html) {
    ['disabled', 'checked', 'selected'].forEach(function restoreBoolean(attr) {
      var badAttr = attr + '=""';
      if (html.indexOf(badAttr) > 0) {
        html = html.replace(badAttr, attr);
      }
    });
    return html;
  }

  function toggleHideShowText(link) {
    var span = link.find('.docs-Example-showMarkup-label');
    var linkText = span.html();
    if (linkText.indexOf('Show') > -1) {
      linkText = linkText.replace('Show', 'Hide');
    } else {
      linkText = linkText.replace('Hide', 'Show');
    }
    span.html(linkText);
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
      } else if (curLineSpaces < lastLineSpaces) {
        indentLevel--;
      }
      curLine = curLine.replace(/^\s*/, spaces(indentLevel*indent));
      lastLineSpaces = curLineSpaces;

      if ( curLine.length > 0 ) {
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

  // Appends a line of text to a textarea and scrolls it to the bottom. Used primarily for demonstrating events.
  $.fn.log = function (text) {
    var logText = this.val();

    if (logText.length > 0) {
      logText += '\n';
    }

    logText += text;
    this.val(logText).scrollTop(this[0].scrollHeight);

    return this;
  };
});
