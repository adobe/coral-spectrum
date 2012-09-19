function changeSize(by) {
  var newSize = (by === 0) ? '16px' : (parseInt(document.body.style.fontSize || 16, 10)+by)+'px';

  document.body.style.fontSize = newSize;
}

$(function() {
  // Prettify code examples
  prettyPrint();
 
  // Size changers
  $('#res-plus').on('click', function(evt) {
    changeSize(+8);
  });
 
  $('#res-minus').on('click', function(evt) {
    changeSize(-8);
  });
  
  $('#res-reset').on('click', function(evt) {
    changeSize(0);
  });
  
 /**
  * Show the paragraph link icon when a heading is hovered on that is within a named section
  */
  (function() {
    var anchor = $('#SectionAnchor');

    $('h1, h2, h3').on('mouseenter', function(evt) {
      var heading = evt.target;
      var section = heading.parentNode;

      if (section.tagName === 'SECTION' && section.id) {
        anchor.attr('href', '#'+section.id);
        $(heading).append(anchor);
        anchor.show();
      }
    }).on('mouseleave', function(evt) {
      anchor.hide();
    });    
  }());
});
