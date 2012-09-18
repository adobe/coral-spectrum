/**
 * Show the paragraph link icon when a heading is hovered on that is within a named section
 */
$(function() {
  var anchor = $('#SectionAnchor');

  $('h1, h2, h3').on('mouseenter', function(evt) {
    var heading = evt.target;
    var section = heading.parentNode;
    
    if (section.tagName == 'SECTION' && section.id) {
      anchor.attr('href', '#'+section.id);
      $(heading).append(anchor);
      anchor.show();
    }
  }).on('mouseleave', function(evt) {
    anchor.hide();
  });
});
